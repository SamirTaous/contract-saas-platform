package com.samir.ops.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DecompteResponse {

    private UUID uuid;
    private String label;
    private BigDecimal amount;
    private String status;

    private LocalDateTime validationDate;

    private String projectName;
    private UUID projectUuid;

    private Double currentProjectProgress;
}