package com.samir.ops.controller;

import com.samir.ops.dto.*;
import com.samir.ops.model.Decompte;
import com.samir.ops.model.Project;
import com.samir.ops.service.ConstructionService;
import com.samir.ops.util.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ConstructionController {

    private final ConstructionService constructionService;
    private final JwtUtils jwtUtils;

    @PostMapping("/projects/create")
    public ResponseEntity<ProjectResponse> createProject(@RequestBody ProjectRequest req, @RequestHeader("Authorization") String token) {
        UserContext user = jwtUtils.getUserContext(token);
        return ResponseEntity.ok(constructionService.createProject(req, user));
    }

    @PostMapping("/decomptes/create")
    public ResponseEntity<DecompteResponse> createDecompte(@RequestBody DecompteRequest req, @RequestHeader("Authorization") String token) {
        UserContext user = jwtUtils.getUserContext(token);
        return ResponseEntity.ok(constructionService.createDecompte(req, user));
    }

    @PatchMapping("/decomptes/{uuid}/pay")
    public ResponseEntity<Void> pay(@PathVariable UUID uuid, @RequestHeader("Authorization") String token) {
        UserContext user = jwtUtils.getUserContext(token);
        constructionService.validateAndPay(uuid, user);
        return ResponseEntity.ok().build();
    }
}
