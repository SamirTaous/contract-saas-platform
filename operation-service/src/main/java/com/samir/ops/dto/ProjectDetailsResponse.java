package com.samir.ops.dto;

import com.samir.ops.dto.DecompteResponse;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ProjectDetailsResponse {
    private UUID uuid;
    private String name;
    private Double physicalProgress;
    private BigDecimal totalPaidAmount;
    private BigDecimal contractTotalAmount;
    private String marketTitle;
    private String marketSupplier;
    private String budgetLineCode;

    private List<DecompteResponse> decomptes;
}