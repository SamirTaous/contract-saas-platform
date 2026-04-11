package com.samir.auth.service;

import com.samir.auth.dto.OrganizationResponse;
import com.samir.auth.dto.UserContext;

import java.util.Optional;

public interface OrganizationService {
    public OrganizationResponse findMyOrganization(UserContext user);
}
