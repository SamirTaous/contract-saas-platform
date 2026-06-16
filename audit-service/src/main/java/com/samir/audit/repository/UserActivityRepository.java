package com.samir.audit.repository;

import com.samir.audit.model.UserActivity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserActivityRepository extends JpaRepository<UserActivity, Long> {

    boolean existsByEventId(UUID eventId);

    Page<UserActivity> findAllByOrderByTimestampDesc(Pageable pageable);

    Page<UserActivity> findByOrgIdOrderByTimestampDesc(Long orgId, Pageable pageable);
}
