package com.sistemadesaude.backend.estoque.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import org.hibernate.annotations.OptimisticLocking;
import org.hibernate.annotations.OptimisticLockType;

/**
 * Saldo por LOTE em um LOCAL DE ARMAZENAMENTO.
 * Mantemos saldo agregado para leituras rápidas e controlamos concorrência com @Version.
 */
@Entity
@Table(name = "est_estoque_lote",
        uniqueConstraints = @UniqueConstraint(name="uk_estoque_local_lote",
                columnNames = {"local_id","lote_id"}))
@Data @NoArgsConstructor @AllArgsConstructor @Builder
@OptimisticLocking(type = OptimisticLockType.VERSION)
public class EstoqueLote {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "local_id")
    private LocalArmazenamento local;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "lote_id")
    private Lote lote;

    /** Saldo atual (quantidade) deste lote nesse local */
    @Column(nullable = false, precision = 19, scale = 3)
    private BigDecimal saldo = BigDecimal.ZERO;

    /** Custo médio/last cost – simples para início (pode sofisticar depois) */
    @Column(precision = 19, scale = 6)
    private BigDecimal custo;

    /** Controle de concorrência otimista */
    @Version
    private Long version;
}
