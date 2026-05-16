package com.samir.ops.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class ProjectResponse {
    private UUID uuid;
    private String name;
    private Double physicalProgress;
    private BigDecimal totalPaidAmount;
    private String marketTitle;
    private String marketSupplier;
}