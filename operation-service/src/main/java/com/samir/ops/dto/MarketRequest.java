package com.samir.ops.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class MarketRequest {
    private String title;
    private String supplier;
    private BigDecimal totalAmount;
    private UUID budgetLineUuid; // The user picks the budget line from a dropdown
}
