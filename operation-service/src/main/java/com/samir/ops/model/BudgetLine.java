package com.samir.ops.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "budget_lines")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BudgetLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private UUID uuid = UUID.randomUUID();

    @Enumerated(EnumType.STRING)
    private Type type;

    @Column(nullable = false)
    private String article;

    @Column(nullable = false)
    private String paragraph;

    @Column(nullable = false)
    private String line;

    @Column(nullable = false, unique = true)
    private String fullCode;

    @Column(precision = 15, scale = 2)
    private BigDecimal initialAmount;

    @Column(precision = 15, scale = 2)
    private BigDecimal committedAmount = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    private BigDecimal spentAmount = BigDecimal.ZERO;

    @Column(nullable = false)
    private Long organizationId;

    @PrePersist
    @PreUpdate
    public void generateFullCode() {
        if (type != null && article != null && paragraph != null && line != null) {
            this.fullCode = String.join(".",
                    this.type.toString(),
                    this.article,
                    this.paragraph,
                    this.line
            );
        }
    }
}
