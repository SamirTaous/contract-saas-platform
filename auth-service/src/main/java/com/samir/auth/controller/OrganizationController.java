package com.samir.auth.controller;


import com.samir.auth.dto.OrganizationResponse;
import com.samir.auth.dto.UserContext;
import com.samir.auth.service.OrganizationService;
import com.samir.auth.util.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/organizations")
public class OrganizationController {

    private final JwtUtils jwtUtils;
    private final OrganizationService organizationService;

    @GetMapping("/me")
    public ResponseEntity<OrganizationResponse> myOrganization(@RequestHeader("Authorization") String authHeader){
        return ResponseEntity.ok(organizationService.findMyOrganization(getUserContext(authHeader)));
    }

    @GetMapping("/all")
    public ResponseEntity<List<OrganizationResponse>> listAllOrganizations(@RequestHeader("Authorization") String authHeader){
        return ResponseEntity.ok(organizationService.findAllOrganizations(getUserContext(authHeader)));
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<OrganizationResponse> findOrganization(@RequestHeader("Authorization") String authHeader, @PathVariable UUID uuid){
        return ResponseEntity.ok(organizationService.findOrganization(getUserContext(authHeader), uuid));
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<Void> removeOrganization(@RequestHeader("Authorization") String authHeader, @PathVariable UUID uuid){
        organizationService.deleteOrganization(getUserContext(authHeader), uuid);
        return ResponseEntity.noContent().build();
    }

    // helper functions
    private UserContext getUserContext(String authHeader){
        return jwtUtils.getUserContext(authHeader);
    }

}
