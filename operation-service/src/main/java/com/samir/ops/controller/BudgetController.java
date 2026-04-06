package com.samir.ops.controller;

import com.samir.ops.dto.BudgetFilterDTO;
import com.samir.ops.model.BudgetLine;
import com.samir.ops.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

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

    @GetMapping("/all")
    public ResponseEntity<List<BudgetLine>> getAllBudgets(){
        List<BudgetLine> budgets = budgetService.getAllBudgets();
        return ResponseEntity.ok(budgets);
    }

    @GetMapping("{fullcode}")
    public ResponseEntity<BudgetLine> getBudgetLineByFullCode(@PathVariable String fullcode){
        return ResponseEntity.ok(budgetService.getBudgetLineByCode(fullcode,1L));
    }

    @GetMapping("{article}")
    public ResponseEntity<BudgetLine> getBudgetLineByArticle(@PathVariable String article){
        return ResponseEntity.ok(budgetService.getBudgetLineByCode(article,1L));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<BudgetLine>> getBudgetsByFilter(@RequestBody BudgetFilterDTO filter){
        return ResponseEntity.ok(budgetService.filterBudget(filter, 1L));
    }
}