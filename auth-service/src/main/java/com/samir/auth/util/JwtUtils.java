package com.samir.auth.util;

import com.samir.auth.dto.UserContext; // Ensure this DTO exists
import com.samir.auth.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtils {

    private final String SECRET_STRING = "your-very-long-and-very-secret-key-for-this-pfe-project-2024";
    private final SecretKey SECRET_KEY = Keys.hmacShaKeyFor(SECRET_STRING.getBytes(StandardCharsets.UTF_8));
    private final long EXPIRATION_TIME = 86400000; // 24 hours

    /**
     * Transforms the raw Authorization header into a structured UserContext object.
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

    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        claims.put("org", user.getOrganization().getName());
        claims.put("orgId", user.getOrganization().getId());
        claims.put("userUuid", user.getUuid().toString());

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
                .compact();
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
            return !extractClaim(token, Claims::getExpiration).before(new Date());
        } catch (Exception e) {
            return false;
        }
    }
}