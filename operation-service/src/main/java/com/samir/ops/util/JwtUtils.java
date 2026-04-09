package com.samir.ops.util;

import com.samir.ops.dto.UserContext; // Ensure this DTO exists in your ops service
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtils {

    // MUST be identical to Auth Service
    private final String SECRET_STRING = "your-very-long-and-very-secret-key-for-this-pfe-project-2024";
    private final SecretKey SECRET_KEY = Keys.hmacShaKeyFor(SECRET_STRING.getBytes(StandardCharsets.UTF_8));

    /**
     * The main entry point for your controllers.
     * Converts the raw "Bearer ..." header into a structured UserContext object.
     */
    public UserContext getUserContext(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Invalid or missing Authorization header");
        }

        String token = authHeader.substring(7);
        Claims claims = extractAllClaims(token);

        return UserContext.builder()
                .username(claims.getSubject())
                .role(claims.get("role", String.class))
                .orgName(claims.get("org", String.class))
                .orgId(extractOrgId(token))
                .userUuid(claims.get("userUuid", String.class))
                .build();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Long extractOrgId(String token) {
        return extractClaim(token, claims -> {
            Object orgId = claims.get("orgId");
            if (orgId instanceof Integer) {
                return ((Integer) orgId).longValue();
            }
            return (Long) orgId;
        });
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean isTokenValid(String token) {
        try {
            return !extractAllClaims(token).getExpiration().before(new Date());
        } catch (Exception e) {
            return false;
        }
    }
}