package com.samir.ops.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class DecompteRequest {
    private String label;
    private BigDecimal amount;
    private UUID projectUuid;
}