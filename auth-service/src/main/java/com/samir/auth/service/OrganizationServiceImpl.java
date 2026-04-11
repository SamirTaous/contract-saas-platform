package com.samir.auth.service;

import com.samir.auth.dto.OrganizationResponse;
import com.samir.auth.dto.UserContext;
import com.samir.auth.dto.UserResponse;
import com.samir.auth.exception.OrganizationNotFoundException;
import com.samir.auth.repository.OrganizationRepository;
import com.samir.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrganizationServiceImpl implements OrganizationService{

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    public OrganizationResponse findMyOrganization(UserContext userContext) {
        return organizationRepository.findOrganizationById(userContext.getOrgId())
                .map(org -> new OrganizationResponse(
                        org.getName(),
                        org.getInviteCode(),
                        userRepository.countUsersByOrganization_Id(org.getId()),
                        userRepository.findUsersByOrganization_Id(userContext.getOrgId()).stream()
                                .map(user -> new UserResponse(user.getUuid(), user.getUsername(), user.getEmail(), user.getOrganization().getName(), user.getRole()))
                                .toList()
                        ))
                .orElseThrow(() -> new OrganizationNotFoundException());
    }

}
