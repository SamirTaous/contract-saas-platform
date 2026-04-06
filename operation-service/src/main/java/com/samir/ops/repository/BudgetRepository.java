package com.samir.ops.repository;


import com.samir.ops.model.BudgetLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BudgetRepository extends JpaRepository<BudgetLine, Long> {

    List<BudgetLine> findBudgetLinesByOrganizationId(Long organizationId);
    Optional<BudgetLine> findBudgetLineByFullCode(String fullCode, Long organizationId);
    Optional<BudgetLine> findBudgetLineByUuid(UUID uuid);
}
