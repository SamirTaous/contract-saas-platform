package com.samir.ops.service;

import com.samir.ops.dto.*;
import com.samir.ops.exception.UnauthorizedAccessException;
import com.samir.ops.model.*;
import com.samir.ops.repository.DecompteRepository;
import com.samir.ops.repository.MarketRepository;
import com.samir.ops.repository.BudgetRepository;
import com.samir.ops.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConstructionService {

    private final ProjectRepository projectRepository;
    private final DecompteRepository decompteRepository;
    private final MarketRepository marketRepository;
    private final BudgetRepository budgetRepository;

    /**
     * 1. Create a physical Project from a SIGNED Market.
     */
    @Transactional
    public ProjectResponse createProject(ProjectRequest request, UserContext user) {
        Market market = marketRepository.findByUuid(request.getMarketUuid())
                .orElseThrow(() -> new RuntimeException("Market not found"));

        // Logic: Cannot start construction if contract isn't signed
        if (market.getStatus() != MarketStatus.SIGNED) {
            throw new RuntimeException("Construction can only start for SIGNED markets.");
        }

        // Logic: Ensure 1-to-1 relationship (one project per market)
        if (projectRepository.existsByMarketId(market.getId())) {
            throw new RuntimeException("A construction project already exists for this market.");
        }

        Project project = Project.builder()
                .uuid(UUID.randomUUID())
                .name(request.getName())
                .market(market)
                .physicalProgress(0.0)
                .totalPaidAmount(BigDecimal.ZERO)
                .organizationId(user.getOrgId())
                .build();

        return mapToProjectResponse(projectRepository.save(project));
    }

    /**
     * View all projects to date
     */

    public List<ProjectResponse> listProjects(UserContext user) {
        return projectRepository.findAllByOrganizationId(user.getOrgId()).stream()
                .map(project -> mapToProjectResponse(project)).toList();
    }

    /**
     * 2. Create a Décompte (Bill) against a Project.
     */
    @Transactional
    public DecompteResponse createDecompte(DecompteRequest request, UserContext user) {
        Project project = projectRepository.findByUuid(request.getProjectUuid())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Logic: Total paid + this bill cannot exceed the contract value
        BigDecimal projectedTotal = project.getTotalPaidAmount().add(request.getAmount());
        if (projectedTotal.compareTo(project.getMarket().getTotalAmount()) > 0) {
            throw new RuntimeException("Payment exceeds contract total!");
        }

        Decompte decompte = Decompte.builder()
                .uuid(UUID.randomUUID())
                .label(request.getLabel())
                .amount(request.getAmount())
                .status(DecompteStatus.PENDING)
                .project(project)
                .build();

        return mapToDecompteResponse(decompteRepository.save(decompte));
    }

    /**
     * 3. VALIDATE & PAY (The "Liquidation" Phase).
     */
    @Transactional
    public void validateAndPay(UUID decompteUuid, UserContext user) {
        Decompte decompte = decompteRepository.findByUuid(decompteUuid)
                .orElseThrow(() -> new RuntimeException("Decompte not found"));

        if (decompte.getStatus() == DecompteStatus.PAID) {
            throw new RuntimeException("This bill is already paid.");
        }

        Project project = decompte.getProject();
        BudgetLine budgetLine = project.getMarket().getBudgetLine();

        // --- THE FINANCIAL SHIFT ---
        // 1. Subtract from Committed (Money is no longer just promised)
        budgetLine.setCommittedAmount(budgetLine.getCommittedAmount().subtract(decompte.getAmount()));

        // 2. Add to Spent (Money has officially left the organization)
        budgetLine.setSpentAmount(budgetLine.getSpentAmount().add(decompte.getAmount()));

        // 3. Update the Project's total payout
        project.setTotalPaidAmount(project.getTotalPaidAmount().add(decompte.getAmount()));

        // 4. Update status and mark the date
        decompte.setStatus(DecompteStatus.PAID);
        decompte.setValidationDate(LocalDateTime.now());

        // Save changes
        budgetRepository.save(budgetLine);
        projectRepository.save(project);
        decompteRepository.save(decompte);

        log.info("LIQUIDATION SUCCESSFUL: {} DH moved to SPENT for project {}", decompte.getAmount(), project.getName());
    }

    public List<ProjectResponse> getMyProjects(UserContext user) {
        return projectRepository.findAllByOrganizationId(user.getOrgId())
                .stream()
                .map(this::mapToProjectResponse)
                .toList();
    }


    public ProjectDetailsResponse getProjectDetails(UUID projectUuid, UserContext user) {
        // 1. Find the project
        Project project = projectRepository.findByUuid(projectUuid)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // 2. Multi-tenancy check
        if (!project.getOrganizationId().equals(user.getOrgId())) {
            throw new UnauthorizedAccessException();
        }

        // 3. Find all decomptes associated with this project
        List<Decompte> decomptes = decompteRepository.findByProjectId(project.getId());

        // 4. Map the decomptes to their clean DTO format
        List<DecompteResponse> decompteResponses = decomptes.stream()
                .map(this::mapToDecompteResponse)
                .toList();

        // 5. Build and return the detailed response
        return ProjectDetailsResponse.builder()
                .uuid(project.getUuid())
                .name(project.getName())
                .physicalProgress(project.getPhysicalProgress())
                .totalPaidAmount(project.getTotalPaidAmount())
                .contractTotalAmount(project.getMarket().getTotalAmount())
                .marketTitle(project.getMarket().getTitle())
                .marketSupplier(project.getMarket().getSupplier())
                .budgetLineCode(project.getMarket().getBudgetLine().getFullCode())
                .decomptes(decompteResponses)
                .build();
    }

    public List<DecompteResponse> getMyDecomptes(UserContext user) {
        List<Decompte> decomptes;

        if ("SUPER_ADMIN".equals(user.getRole())) {
            decomptes = decompteRepository.findAll();
        } else {
            decomptes = decompteRepository.findAllByOrganizationId(user.getOrgId());
        }

        return decomptes.stream()
                .map(this::mapToDecompteResponse)
                .toList();
    }

    public List<DecompteResponse> getAllDecomptes(UserContext user) {
        // Only SUPER_ADMIN can see all decomptes across all organizations
        if (!"SUPER_ADMIN".equals(user.getRole())) {
            throw new UnauthorizedAccessException();
        }

        List<Decompte> decomptes = decompteRepository.findAll();

        return decomptes.stream()
                .map(this::mapToDecompteResponse)
                .toList();
    }

    // helper functions

    private ProjectResponse mapToProjectResponse(Project p) {
        return ProjectResponse.builder()
                .uuid(p.getUuid())
                .name(p.getName())
                .physicalProgress(p.getPhysicalProgress())
                .totalPaidAmount(p.getTotalPaidAmount())
                .marketTitle(p.getMarket().getTitle())
                .marketSupplier(p.getMarket().getSupplier())
                .build();
    }

    private DecompteResponse mapToDecompteResponse(Decompte d) {
        return DecompteResponse.builder()
                .uuid(d.getUuid())
                .label(d.getLabel())
                .amount(d.getAmount())
                .status(d.getStatus().toString())
                .validationDate(d.getValidationDate())
                .projectName(d.getProject().getName())
                .projectUuid(d.getProject().getUuid())
                .currentProjectProgress(d.getProject().getPhysicalProgress())
                .build();
    }

}