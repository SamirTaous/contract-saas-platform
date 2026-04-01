package com.samir.auth.service;

import com.samir.auth.dto.LoginRequest;
import com.samir.auth.dto.RegisterRequest;
import com.samir.auth.model.Organization;
import com.samir.auth.model.Role;
import com.samir.auth.model.User;
import com.samir.auth.repository.OrganizationRepository;
import com.samir.auth.repository.UserRepository;
import com.samir.auth.util.InviteCodeGenerator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import static com.samir.auth.util.InviteCodeGenerator.generate;

@RequiredArgsConstructor
@Service
public class AuthServiceImpl implements AuthService{

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public String register(RegisterRequest request) {

        // validate data
        if(userRepository.existsByEmail(request.getEmail()))
            return "This email already exists !";
        if(userRepository.existsUserByUsername(request.getUsername()))
            return "This username already exists !";

        Organization organization;
        // add user
        // first path = create a user and plug into organization
        if (request.getInviteCode() != null) {

            organization = organizationRepository
                    .findOrganizationByInviteCode(request.getInviteCode())
                    .orElseThrow(() ->
                            new RuntimeException("Invalid Invite Code! Please check with your admin.")
                    );
            saveUser(request, organization, Role.USER);

            return "Successfully joined "+ organization.getName();
        }

        // second path = create a user and create organization
        else{
            organization = new Organization();
            organization.setName(request.getOrgName());
            organization.setInviteCode(generate(request.getOrgName()));
            organizationRepository.save(organization);
            saveUser(request, organization, Role.USER);

            return "Successfully created organization"+ organization.getName();
        }
    }

    @Override
    public String login(LoginRequest request) {
        if(!userRepository.existsUserByUsername(request.getUsername())) {
            return "Wrong username or password";
        }
        else{
            User user = userRepository.findUserByUsername(request.getUsername());
            if(user.getPassword()!=request.getPassword()){
                return "Wrong username or password";
            }
            else
                return "User successfully logged in";
        }
    }

    private void saveUser(RegisterRequest request, Organization org, Role role){
        User user = new User();
        user.setEmail(request.getEmail());
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setOrganization(org);
        user.setRole(role);
        userRepository.save(user);
    }
}
