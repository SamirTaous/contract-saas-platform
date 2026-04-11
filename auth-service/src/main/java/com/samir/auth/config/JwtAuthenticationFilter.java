package com.samir.auth.config;

import com.samir.auth.util.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // 1. If no Bearer token, just move to the next filter (Spring will block it later)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String jwt = authHeader.substring(7);
        try {
            String username = jwtUtils.extractUsername(jwt);
            System.out.println(">>> USERNAME EXTRACTED: " + username);
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                if (jwtUtils.isTokenValid(jwt)) {
                    // 2. Extract Role from JWT
                    String role = jwtUtils.extractClaim(jwt, claims -> claims.get("role", String.class));

                    // 3. Tell Spring Security who this user is and what they can do
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            username, null, List.of(new SimpleGrantedAuthority("ROLE_" + role))
                    );

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
                else{
                    System.out.println(">>> TOKEN IS INVALID for user: " + username);
                }
            }
        } catch (Exception e) {
            System.out.println(">>> FAILED TO EXTRACT USERNAME: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}