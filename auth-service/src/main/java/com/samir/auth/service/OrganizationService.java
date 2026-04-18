package com.samir.auth.service;

import com.samir.auth.dto.OrganizationResponse;
import com.samir.auth.dto.UserContext;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrganizationService {
    public OrganizationResponse findMyOrganization(UserContext user);

    List<OrganizationResponse> findAllOrganizations(UserContext user);

    public void deleteOrganization(UserContext userContext, UUID uuid);

    public OrganizationResponse findOrganization(UserContext userContext, UUID uuid);
}
