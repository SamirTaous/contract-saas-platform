package com.samir.ops.model;

import com.samir.ops.model.Market;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "projects")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private UUID uuid = UUID.randomUUID();

    private String name;

    @OneToOne
    @JoinColumn(name = "market_id", nullable = false)
    private Market market;

    private Double physicalProgress = 0.0;

    @Column(precision = 15, scale = 2)
    private BigDecimal totalPaidAmount = BigDecimal.ZERO;

    @Column(nullable = false)
    private Long organizationId;
}