package com.samir.ops.controller;

import com.samir.ops.dto.BudgetFilterDTO;
import com.samir.ops.dto.UserContext;
import com.samir.ops.model.BudgetLine;
import com.samir.ops.service.BudgetService;
import com.samir.ops.util.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.apache.catalina.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/budget")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;
    private final JwtUtils jwtUtils;

    @PostMapping("/import")
    public ResponseEntity<String> importBudget(@RequestParam("file") MultipartFile file,
                                               @RequestHeader("Authorization") String authHeader) {
        try {
            UserContext user = jwtUtils.getUserContext(authHeader);
            budgetService.importBudgetExcel(file, user.getOrgId());
            return ResponseEntity.ok("Budget imported successfully for "+ user.getOrgName());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Import failed: " + e.getMessage());
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<BudgetLine>> getAllBudgets(@RequestHeader("Authorization") String authHeader){
        UserContext user = jwtUtils.getUserContext(authHeader);
        List<BudgetLine> budgets = budgetService.getAllBudgets(user);
        return ResponseEntity.ok(budgets);
    }

    @GetMapping("{uuid}")
    public ResponseEntity<BudgetLine> getBudgetByUuid(@RequestHeader("Authorization") String authHeader, @PathVariable UUID uuid){
        UserContext user = jwtUtils.getUserContext(authHeader);
        return ResponseEntity.ok(budgetService.getBudgetLineByUuid(uuid, user));
    }

    @GetMapping("/code/{fullcode}")
    public ResponseEntity<BudgetLine> getBudgetLineByFullCode(@RequestHeader("Authorization") String authHeader, @PathVariable String fullcode){
        UserContext user = jwtUtils.getUserContext(authHeader);
        return ResponseEntity.ok(budgetService.getBudgetLineByCode(fullcode,user));
    }

    @GetMapping("/article/{article}")
    public ResponseEntity<List<BudgetLine>> getBudgetLineByArticle(@RequestHeader("Authorization") String authHeader, @PathVariable String article){
        UserContext user = jwtUtils.getUserContext(authHeader);
        return ResponseEntity.ok(budgetService.getBudgetLineByArticle(article,user));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<BudgetLine>> getBudgetsByFilter(@RequestHeader("Authorization") String authHeader, @RequestBody BudgetFilterDTO filter){
        UserContext user = jwtUtils.getUserContext(authHeader);
        return ResponseEntity.ok(budgetService.filterBudget(filter, user));
    }
}