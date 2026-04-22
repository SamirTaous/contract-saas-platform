package com.samir.ops.controller;

import com.samir.ops.dto.MarketRequest;
import com.samir.ops.dto.UserContext;
import com.samir.ops.model.Market;
import com.samir.ops.service.MarketService;
import com.samir.ops.util.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.apache.catalina.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/markets")
@RequiredArgsConstructor
public class MarketController {

    private final MarketService marketService;
    private final JwtUtils jwtUtils;

    @PostMapping("/create")
    public ResponseEntity<Void> create(@RequestBody MarketRequest request, @RequestHeader("Authorization") String token) {
        UserContext user = jwtUtils.getUserContext(token);
        marketService.createMarket(request, user);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/my-org")
    public ResponseEntity<List<Market>> list(@RequestHeader("Authorization") String token) {
        UserContext user = jwtUtils.getUserContext(token);
        return ResponseEntity.ok(marketService.getMyMarkets(user));
    }

    @PatchMapping("/{uuid}/sign")
    public ResponseEntity<Void> sign(@PathVariable UUID uuid, @RequestHeader("Authorization") String token) {
        UserContext user = jwtUtils.getUserContext(token);
        marketService.signMarket(uuid, user);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{uuid}/cancel")
    public ResponseEntity<Void> cancel(@PathVariable UUID uuid, @RequestHeader("Authorization") String token) {
        UserContext user = jwtUtils.getUserContext(token);
        marketService.cancelMarket(uuid, user);
        return ResponseEntity.noContent().build();
    }
}