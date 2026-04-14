package com.samir.auth.service;

import com.samir.auth.dto.OrganizationResponse;
import com.samir.auth.dto.UserContext;
import com.samir.auth.dto.UserResponse;
import com.samir.auth.exception.OrganizationNotEmptyException;
import com.samir.auth.exception.OrganizationNotFoundException;
import com.samir.auth.exception.UnauthorizedClientException;
import com.samir.auth.model.Organization;
import com.samir.auth.repository.OrganizationRepository;
import com.samir.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrganizationServiceImpl implements OrganizationService{

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    public OrganizationResponse findMyOrganization(UserContext userContext) {
        return organizationRepository.findOrganizationById(userContext.getOrgId())
                .map(org -> new OrganizationResponse(
                        org.getUuid(),
                        org.getName(),
                        org.getInviteCode(),
                        userRepository.countUsersByOrganization_Id(org.getId()),
                        userRepository.findUsersByOrganization_Id(userContext.getOrgId()).stream()
                                .map(user -> new UserResponse(user.getUuid(), user.getUsername(), user.getEmail(), user.getOrganization().getName(), user.getRole()))
                                .toList()
                        ))
                .orElseThrow(() -> new OrganizationNotFoundException());
    }

    @Override
    public List<OrganizationResponse> findAllOrganizations(UserContext userContext) {
        if(!userContext.getRole().equals("SUPER_ADMIN"))
            throw new UnauthorizedClientException(userContext.getUsername());
        return organizationRepository.findAll().stream()
                .map(org-> new OrganizationResponse(
                        org.getUuid(),
                        org.getName(),
                        org.getInviteCode(),
                        userRepository.countUsersByOrganization_Id(org.getId()),
                        userRepository.findUsersByOrganization_Id(userContext.getOrgId()).stream()
                                .map(user -> new UserResponse(user.getUuid(), user.getUsername(), user.getEmail(), user.getOrganization().getName(), user.getRole()))
                                .toList()
                )).toList();
    }

    @Override
    public void deleteOrganization(UserContext userContext, UUID uuid) {
        if(!userContext.getRole().equals("SUPER_ADMIN"))
            throw new UnauthorizedClientException(userContext.getUsername());
        Organization organization = organizationRepository.findOrganizationByUuid(uuid)
                .orElseThrow(()-> new OrganizationNotFoundException());
        if(isEmpty(organization))
            organizationRepository.delete(organization);
        else
            throw new OrganizationNotEmptyException(organization.getName());
    }

    // helper functions

    private boolean isEmpty(Organization organization){
        return userRepository.countUsersByOrganization_Id(organization.getId()) != 0 ? false : true;
    }
}
