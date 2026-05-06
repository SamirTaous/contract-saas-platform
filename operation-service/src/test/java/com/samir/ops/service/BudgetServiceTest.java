package com.samir.ops.service;

import com.samir.ops.dto.BudgetFilterDTO;
import com.samir.ops.dto.UserContext;
import com.samir.ops.exception.UnauthorizedAccessException;
import com.samir.ops.model.BudgetLine;
import com.samir.ops.model.Type;
import com.samir.ops.repository.BudgetRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BudgetServiceTest {

    @Mock
    private BudgetRepository budgetRepository;

    @InjectMocks
    private BudgetService budgetService;

    // -------------------------------------------------------------------------
    // 1. ROLE-BASED VISIBILITY
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("Should return ALL budgets if user is SUPER_ADMIN")
    void getAllBudgets_SuperAdmin() {
        UserContext context = UserContext.builder().role("SUPER_ADMIN").build();

        budgetService.getAllBudgets(context);

        verify(budgetRepository, times(1)).findAll();
        verify(budgetRepository, never()).findBudgetLinesByOrganizationId(anyLong());
    }

    @Test
    @DisplayName("Should return only ORG budgets if user is ADMIN")
    void getAllBudgets_OrgAdmin() {
        UserContext context = UserContext.builder().role("ADMIN").orgId(8L).build();

        budgetService.getAllBudgets(context);

        verify(budgetRepository, times(1)).findBudgetLinesByOrganizationId(8L);
        verify(budgetRepository, never()).findAll();
    }

    // -------------------------------------------------------------------------
    // 2. SINGLE RETRIEVAL BY CODE
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("Should find budget line by full code successfully")
    void getBudgetLineByCode_Success() {
        String code = "MDD.900.10.79";
        BudgetLine mockLine = new BudgetLine();
        mockLine.setFullCode(code);

        when(budgetRepository.findByFullCodeAndOrganizationId(code, 8L))
                .thenReturn(Optional.of(mockLine));

        BudgetLine result = budgetService.getBudgetLineByCode(
                code, UserContext.builder().orgId(8L).build());

        assertEquals(code, result.getFullCode());
    }

    @Test
    @DisplayName("Should throw exception when budget code does not exist")
    void getBudgetLineByCode_NotFound() {
        String code = "INV.999";

        when(budgetRepository.findByFullCodeAndOrganizationId(code, 8L))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
                budgetService.getBudgetLineByCode(
                        code, UserContext.builder().orgId(8L).build()));
    }

    // -------------------------------------------------------------------------
    // 3. SINGLE RETRIEVAL BY UUID
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("Should find budget line by UUID successfully")
    void getBudgetLineByUuid_Success() {
        UUID uuid = UUID.randomUUID();
        BudgetLine mockLine = new BudgetLine();
        mockLine.setOrganizationId(8L);

        when(budgetRepository.findBudgetLineByUuid(uuid))
                .thenReturn(Optional.of(mockLine));

        BudgetLine result = budgetService.getBudgetLineByUuid(
                uuid, UserContext.builder().orgId(8L).build());

        assertNotNull(result);
        verify(budgetRepository).findBudgetLineByUuid(uuid);
    }

    @Test
    @DisplayName("Should throw exception when UUID does not exist")
    void getBudgetLineByUuid_NotFound() {
        UUID uuid = UUID.randomUUID();

        when(budgetRepository.findBudgetLineByUuid(uuid))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
                budgetService.getBudgetLineByUuid(
                        uuid, UserContext.builder().orgId(8L).build()));
    }

    @Test
    @DisplayName("Should throw UnauthorizedAccessException when UUID belongs to a different org")
    void getBudgetLineByUuid_WrongOrg() {
        UUID uuid = UUID.randomUUID();
        BudgetLine mockLine = new BudgetLine();
        mockLine.setOrganizationId(99L); // different org

        when(budgetRepository.findBudgetLineByUuid(uuid))
                .thenReturn(Optional.of(mockLine));

        assertThrows(UnauthorizedAccessException.class, () ->
                budgetService.getBudgetLineByUuid(
                        uuid, UserContext.builder().orgId(8L).build()));
    }

    // -------------------------------------------------------------------------
    // 4. RETRIEVAL BY ARTICLE
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("Should return list of budget lines filtered by article")
    void getBudgetLineByArticle_ReturnsList() {
        BudgetLine mockLine = new BudgetLine();

        when(budgetRepository.findByArticleAndOrganizationId("900", 8L))
                .thenReturn(List.of(mockLine));

        List<BudgetLine> result = budgetService.getBudgetLineByArticle(
                "900", UserContext.builder().orgId(8L).build());

        assertEquals(1, result.size());
        verify(budgetRepository).findByArticleAndOrganizationId("900", 8L);
    }

    @Test
    @DisplayName("Should return empty list when no budget lines match the article")
    void getBudgetLineByArticle_Empty() {
        when(budgetRepository.findByArticleAndOrganizationId("999", 8L))
                .thenReturn(List.of());

        List<BudgetLine> result = budgetService.getBudgetLineByArticle(
                "999", UserContext.builder().orgId(8L).build());

        assertTrue(result.isEmpty());
    }

    // -------------------------------------------------------------------------
    // 5. HIERARCHICAL FILTERING
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("Filter: Priority 1 — Full search (Article + Paragraph + Line)")
    void filterBudget_FullSearch() {
        BudgetFilterDTO filter = new BudgetFilterDTO(Type.MDD, "900", "10", "79");

        budgetService.filterBudget(filter, UserContext.builder().orgId(8L).build());

        verify(budgetRepository)
                .findByArticleAndParagraphAndLineAndOrganizationId("900", "10", "79", 8L);
    }

    @Test
    @DisplayName("Filter: Priority 2 — Category search (Article + Paragraph)")
    void filterBudget_CategorySearch() {
        BudgetFilterDTO filter = new BudgetFilterDTO(Type.MDD, "900", "10", null);

        budgetService.filterBudget(filter, UserContext.builder().orgId(8L).build());

        verify(budgetRepository)
                .findByArticleAndParagraphAndOrganizationId("900", "10", 8L);
    }

    @Test
    @DisplayName("Filter: Priority 3 — Article search (Article only)")
    void filterBudget_ArticleSearch() {
        BudgetFilterDTO filter = new BudgetFilterDTO(Type.MDD, "900", null, null);

        budgetService.filterBudget(filter, UserContext.builder().orgId(8L).build());

        verify(budgetRepository)
                .findByArticleAndOrganizationId("900", 8L);
    }

    @Test
    @DisplayName("Filter: Priority 4 — Type search (Type only)")
    void filterBudget_TypeSearch() {
        BudgetFilterDTO filter = new BudgetFilterDTO(Type.INV, null, null, null);

        budgetService.filterBudget(filter, UserContext.builder().orgId(8L).build());

        verify(budgetRepository)
                .findByTypeAndOrganizationId(Type.INV, 8L);
    }

    @Test
    @DisplayName("Filter: Should throw exception when all filter fields are null")
    void filterBudget_EmptyError() {
        BudgetFilterDTO filter = new BudgetFilterDTO(null, null, null, null);

        assertThrows(RuntimeException.class, () ->
                budgetService.filterBudget(filter, UserContext.builder().orgId(8L).build()));
    }

    // -------------------------------------------------------------------------
    // 6. EXCEL IMPORT
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("Service should be injectable (placeholder until real file test is added)")
    void importExcel_ServiceIsInjectable() {
        assertNotNull(budgetService);
    }
}