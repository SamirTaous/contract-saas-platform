package com.samir.ops.repository;

import com.samir.ops.model.Decompte;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DecompteRepository extends JpaRepository<Decompte, Long> {
    Optional<Decompte> findByUuid(UUID decompteUuid);

    List<Decompte> findByProjectId(Long projectId);
}
