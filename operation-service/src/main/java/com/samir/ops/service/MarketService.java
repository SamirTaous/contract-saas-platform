package com.samir.ops.service;

import com.samir.ops.dto.MarketRequest;
import com.samir.ops.dto.MarketResponse;
import com.samir.ops.dto.UserContext;
import com.samir.ops.exception.BudgetLineNotFoundException;
import com.samir.ops.exception.MarketNotFoundException;
import com.samir.ops.exception.UnauthorizedAccessException;
import com.samir.ops.exception.UnsufficientBudgetException;
import com.samir.ops.model.BudgetLine;
import com.samir.ops.model.Market;
import com.samir.ops.model.MarketStatus;
import com.samir.ops.repository.BudgetRepository;
import com.samir.ops.repository.MarketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.yaml.snakeyaml.error.Mark;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarketService {

    private final MarketRepository marketRepository;
    private final BudgetRepository budgetRepository;

    /**
     * Creates a new procurement project (Market).
     * Validates if the selected budget line has enough funds.
     */
    @Transactional
    public MarketResponse createMarket(MarketRequest request, UserContext user) {
        BudgetLine line = budgetRepository.findBudgetLineByUuid(request.getBudgetLineUuid())
                .orElseThrow(() -> new BudgetLineNotFoundException());

        // 1. Validation: Ensure user belongs to the budget's organization
        if (!line.getOrganizationId().equals(user.getOrgId())) {
            throw new UnauthorizedAccessException();
        }

        // 2. Validation: Check Solvency (Is there enough money?)
        BigDecimal available = line.getInitialAmount().subtract(line.getCommittedAmount());
        if (available.compareTo(request.getTotalAmount()) < 0) {
            throw new UnsufficientBudgetException(available);
        }

        // 3. Save as DRAFT
        Market market = new Market();
        market.setTitle(request.getTitle());
        market.setSupplier(request.getSupplier());
        market.setTotalAmount(request.getTotalAmount());
        market.setBudgetLine(line);
        market.setOrganizationId(user.getOrgId());
        market.setStatus(MarketStatus.DRAFT);

        marketRepository.save(market);

        return mapToResponse(market);
    }

    /**
     * The "Engagement" Phase.
     * Officially signs the contract and locks the money in the Budget Service.
     */
    @Transactional
    public MarketResponse signMarket(UUID marketUuid, UserContext user) {
        Market market = marketRepository.findByUuid(marketUuid)
                .orElseThrow(() -> new RuntimeException("Market not found"));

        if (market.getOrganizationId() != user.getOrgId()){
            throw new UnauthorizedAccessException();
        }

        if (market.getStatus() != MarketStatus.DRAFT) {
            throw new RuntimeException("Only DRAFT markets can be signed.");
        }

        BigDecimal available = market.getBudgetLine().getInitialAmount()
                .subtract(market.getBudgetLine().getCommittedAmount());

        if (available.compareTo(market.getTotalAmount()) < 0) {
            throw new RuntimeException("Cannot sign! Budget was depleted by another project. Only " + available + " DH left.");
        }

        // Subtract from available budget
        BudgetLine line = market.getBudgetLine();
        line.setCommittedAmount(line.getCommittedAmount().add(market.getTotalAmount()));

        market.setStatus(MarketStatus.SIGNED);

        budgetRepository.save(line); // Update the budget line
        marketRepository.save(market); // Update the market status
        return mapToResponse(market);
    }

    /**
     * The "Cancel" Phase.
     * Back out of the contract and unlock the money in the Budget Service.
     */

    @Transactional
    public void cancelMarket(UUID uuid, UserContext user) {

        Market market = marketRepository.findByUuid(uuid)
                .orElseThrow(() -> new MarketNotFoundException());

        if (market.getOrganizationId() != user.getOrgId()){
            throw new UnauthorizedAccessException();
        }

        if (market.getStatus() == MarketStatus.SIGNED) {
            // subtract from Committed
            BudgetLine line = market.getBudgetLine();
            line.setCommittedAmount(line.getCommittedAmount().subtract(market.getTotalAmount()));
            budgetRepository.save(line);
        }
        marketRepository.delete(market);
    }

    public List<MarketResponse> getMyMarkets(UserContext user) {
        if ("SUPER_ADMIN".equals(user.getRole())) {
            return marketRepository.findAll().stream()
                    .map(market -> mapToResponse(market))
                    .toList();
        }
        return marketRepository.findAllByOrganizationId(user.getOrgId()).stream()
                .map(market -> mapToResponse(market))
                .toList();
    }

    private MarketResponse mapToResponse(Market market) {
        return new MarketResponse(
                market.getUuid(),
                market.getTitle(),
                market.getSupplier(),
                market.getTotalAmount(),
                market.getStatus().toString(),
                market.getBudgetLine().getFullCode(),
                market.getBudgetLine().getUuid(),
                market.getBudgetLine().getInitialAmount()
                .subtract(market.getBudgetLine().getCommittedAmount())
                .subtract(market.getBudgetLine().getSpentAmount())
                );
    }
}