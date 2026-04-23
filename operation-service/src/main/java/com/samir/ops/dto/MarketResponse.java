package com.samir.ops.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@AllArgsConstructor
public class MarketResponse {
    private UUID uuid;
    private String title;
    private String supplier;
    private BigDecimal totalAmount;
    private String status;
    private String budgetLineCode;
    private UUID budgetLineUuid;
    private BigDecimal remainingBudget;
}
