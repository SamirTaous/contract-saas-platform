package com.samir.ops.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Year;
import java.util.UUID;

@Entity
@Table(name = "budget_lines", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"full_code", "organization_id", "fiscal_year"})
})
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

    @Column(nullable = false)
    private int fiscalYear;

    @Enumerated(EnumType.STRING)
    private Type type;

    @Column(nullable = false)
    private String article;

    @Column(nullable = false)
    private String paragraph;

    @Column(nullable = false)
    private String line;

    @Column(nullable = false)
    private String fullCode;

    @Column
    private String label;

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
