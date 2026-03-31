package com.samir.auth.repository;

import com.samir.auth.model.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrganizationRepository extends JpaRepository <Organization,Long> {
    boolean existsOrganizationByName(String name);

    boolean existsOrganizationByInviteCode(String inviteCode);

    Optional<Organization> findOrganizationByInviteCode(String inviteCode);
}
