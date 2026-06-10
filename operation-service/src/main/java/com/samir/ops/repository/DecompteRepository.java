package com.samir.ops.repository;

import com.samir.ops.model.Decompte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DecompteRepository extends JpaRepository<Decompte, Long> {
    Optional<Decompte> findByUuid(UUID decompteUuid);

    List<Decompte> findByProjectId(Long projectId);

    @Query("SELECT d FROM Decompte d WHERE d.project.organizationId = :orgId")
    List<Decompte> findAllByOrganizationId(@Param("orgId") Long orgId);
}
