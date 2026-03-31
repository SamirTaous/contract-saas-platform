package com.samir.auth.repository;

import com.samir.auth.model.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrganizationRepository extends JpaRepository <Organization,Long> {
    boolean existsOrganizationByName(String name);
}
