package com.sistemadesaude.backend.exames.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "lab_texto_pronto")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TextoPronto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exame_id")
    private Exame exame;

    @Column(name = "abreviatura", length = 50, nullable = false)
    private String abreviatura;

    @Lob
    @Column(name = "descricao", nullable = false)
    private String descricao; // até 4000 caracteres

    @Column(name = "ativo")
    @Builder.Default
    private Boolean ativo = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}