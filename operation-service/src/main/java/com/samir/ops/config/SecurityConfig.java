package com.samir.ops.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor // Automatically injects the jwtAuthFilter bean
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)

                // 1. Set session management to STATELESS (required for JWT)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // 2. Define authorization rules
                .authorizeHttpRequests(auth -> auth


                        // Only ADMINS can import budget files
                        .requestMatchers("/api/budget/import").hasAnyRole("ADMIN", "SUPER_ADMIN")
                        .requestMatchers("/api/budget/all").hasAnyRole("ADMIN", "SUPER_ADMIN")

                        // All other API endpoints require a valid login
                        .anyRequest().authenticated()
                )

                // 3. Add your custom JWT filter before the standard login filter
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 1. Allow your React development server (Vite default is 5173)
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));

        // 2. Allow all the standard HTTP methods you are using
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

        // 3. Allow headers like "Authorization" (for JWT) and "Content-Type" (for JSON)
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));

        // 4. Allow the browser to send credentials (like cookies or auth headers)
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Apply to all URLs
        return source;
    }
}