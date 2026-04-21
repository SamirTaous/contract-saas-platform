package com.samir.ops.repository;

import com.samir.ops.model.Market;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MarketRepository extends JpaRepository<Market, Long> {
    List<Market> findAllByOrganizationId(Long organizationId);
    Optional<Market> findByUuid(UUID uuid);
}
