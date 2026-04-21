package com.samir.ops.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "markets")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Market {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private UUID uuid = UUID.randomUUID();

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    private MarketStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "budget_line_id")
    private BudgetLine budgetLine;

    @Column(nullable = false)
    private Long organizationId;
}
