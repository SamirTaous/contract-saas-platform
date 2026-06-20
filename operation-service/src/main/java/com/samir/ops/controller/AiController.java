package com.samir.ops.controller;

import com.samir.ops.dto.AiResponse;
import com.samir.ops.dto.UserContext;
import com.samir.ops.service.AiService;
import com.samir.ops.util.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;
    private final JwtUtils jwtUtils;

    @GetMapping("/recommendations")
    public ResponseEntity<AiResponse> getRecommendations(@RequestHeader("Authorization") String token) {
        UserContext user = jwtUtils.getUserContext(token);
        return ResponseEntity.ok(aiService.getBudgetRecommendations(user.getOrgId()));
    }
}