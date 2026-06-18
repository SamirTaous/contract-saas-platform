package com.samir.auth.config;

import com.samir.auth.activity.ActivityLoggingFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor // Automatically injects the jwtAuthFilter
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final ActivityLoggingFilter activityLoggingFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)

                // 1. Make the session STATELESS (We use JWT, not Cookies/Sessions)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // 2. Define the "Lock" rules
                .authorizeHttpRequests(auth -> auth
                        // Public auth endpoints (No token needed)
                        .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
                        .requestMatchers("/api/auth/me").authenticated()

                        // List all users / specific user
                        .requestMatchers(HttpMethod.GET, "/api/users/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasAnyRole("ADMIN", "SUPER_ADMIN")

                        // List my organization ( admins only )
                        .requestMatchers("/api/organizations/me").hasAnyRole("ADMIN","SUPER_ADMIN")
                        .requestMatchers("/api/organizations/all").hasRole("SUPER_ADMIN")
                        .requestMatchers("/api/organizations/*").hasRole("SUPER_ADMIN")
                        // Protected endpoints (Token REQUIRED)
                        .anyRequest().authenticated()
                )

                // 3. Add our Custom JWT Filter BEFORE the standard Spring Login filter
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(activityLoggingFilter, JwtAuthenticationFilter.class)

                // 4. Disable the default Login Form
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable);

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