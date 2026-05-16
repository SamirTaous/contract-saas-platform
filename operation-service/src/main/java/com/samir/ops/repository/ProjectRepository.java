package com.samir.ops.repository;

import com.samir.ops.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    boolean existsByMarketId(Long id);

    Optional<Project> findByUuid(UUID projectUuid);

    List<Project> findAllByOrganizationId(Long orgId);
}
