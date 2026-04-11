package com.samir.auth.controller;


import com.samir.auth.dto.OrganizationResponse;
import com.samir.auth.dto.UserContext;
import com.samir.auth.service.OrganizationService;
import com.samir.auth.util.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/organizations")
public class OrganizationController {

    private final JwtUtils jwtUtils;
    private final OrganizationService organizationService;

    @GetMapping("/me")
    public ResponseEntity<OrganizationResponse> myOrganization(@RequestHeader("Authorization") String authHeader){
        UserContext userContext = jwtUtils.getUserContext(authHeader);
        return ResponseEntity.ok(organizationService.findMyOrganization(userContext));
    }

}
