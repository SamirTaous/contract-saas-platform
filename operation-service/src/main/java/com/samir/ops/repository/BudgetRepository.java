package com.samir.ops.repository;


import com.samir.ops.model.BudgetLine;
import com.samir.ops.model.Type;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Year;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BudgetRepository extends JpaRepository<BudgetLine, Long> {

    List<BudgetLine> findBudgetLinesByOrganizationId(Long organizationId);
    Optional<BudgetLine> findBudgetLineByFullCode(String fullCode, Long organizationId);
    Optional<BudgetLine> findBudgetLineByUuid(UUID uuid);
    Optional<BudgetLine> findByFullCodeAndOrganizationId(String fullCode, Long organizationId);
    List<BudgetLine> findByArticleAndOrganizationId(String article, Long organizationId);
    List<BudgetLine> findByTypeAndOrganizationId(Type type, Long orgId);

    List<BudgetLine> findByOrganizationIdAndFiscalYear(Long organizationId, Year fiscalYear);

    Optional<BudgetLine> findBudgetLineByUuidAndFiscalYear(UUID uuid, Year fiscalYear);
    
    Boolean existsBudgetLinesByOrganizationIdAndFullCode(Long organizationId, String fullCode);

    List<BudgetLine> findByArticleAndParagraphAndOrganizationId(String article, String paragraph, Long orgId);

    List<BudgetLine> findByArticleAndParagraphAndLineAndOrganizationId(String article, String paragraph, String line, Long orgId);

    Optional<BudgetLine> findByFullCodeAndOrganizationIdAndFiscalYear(String fullCode, Long organizationId, int year);
}
