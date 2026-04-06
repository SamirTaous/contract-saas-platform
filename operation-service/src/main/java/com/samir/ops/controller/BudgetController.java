package com.samir.ops.controller;

import com.samir.ops.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/budget")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @PostMapping("/import")
    public ResponseEntity<String> importBudget(@RequestParam("file") MultipartFile file) {
        try {
            // hardcoded org id for testing , later we will use the jwt token
            budgetService.importBudgetExcel(file, 1L);
            return ResponseEntity.ok("Budget imported successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Import failed: " + e.getMessage());
        }
    }
}