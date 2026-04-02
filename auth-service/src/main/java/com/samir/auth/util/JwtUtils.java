package com.samir.auth.util;

import com.samir.auth.model.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtils {

    // 1. Ensure this key is at least 32 characters long
    private final String SECRET_STRING = "your-very-long-and-very-secret-key-for-this-pfe-project-2024";

    // 2. Generate a secure Key object from the string
    private final SecretKey SECRET_KEY = Keys.hmacShaKeyFor(SECRET_STRING.getBytes(StandardCharsets.UTF_8));

    private final long EXPIRATION_TIME = 86400000; // 24 hours

    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        claims.put("org", user.getOrganization().getName());
        claims.put("userUuid", user.getUuid().toString());

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getUsername()) // Using username as subject
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                // 3. Use the SecretKey object directly
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
                .compact();
    }
}