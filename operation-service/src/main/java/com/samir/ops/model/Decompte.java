package com.samir.ops.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "decomptes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Decompte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private UUID uuid = UUID.randomUUID();

    private String label; // e.g., "Décompte N°1 - Gros œuvre"

    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal amount; // The value of work being paid now

    private LocalDateTime validationDate;

    @Enumerated(EnumType.STRING)
    private DecompteStatus status = DecompteStatus.PENDING;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
}