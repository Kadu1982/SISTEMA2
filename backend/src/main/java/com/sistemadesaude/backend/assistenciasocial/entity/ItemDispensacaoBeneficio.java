package com.sistemadesaude.backend.assistenciasocial.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

/**
 * Classe entidade que representa um item de dispensação de benefício.
 */
@Entity
@Table(name = "itens_dispensacao_beneficio")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemDispensacaoBeneficio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dispensacao_id", nullable = false)
    private DispensacaoBeneficio dispensacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "beneficio_id", nullable = false)
    private Beneficio beneficio;

    @Column(name = "quantidade", nullable = false)
    private Integer quantidade;

    @Column(name = "valor_unitario", precision = 10, scale = 2, nullable = false)
    private BigDecimal valorUnitario;

    @Column(name = "valor_total", precision = 10, scale = 2, nullable = false)
    private BigDecimal valorTotal;
}
