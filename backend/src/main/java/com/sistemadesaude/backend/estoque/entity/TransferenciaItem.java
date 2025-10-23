package com.sistemadesaude.backend.estoque.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "est_transferencia_item")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TransferenciaItem {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false) private Transferencia transferencia;
    @ManyToOne(optional = false) private Lote lote;

    /** Quantidade enviada pelo local de origem */
    @Column(nullable = false, precision = 19, scale = 3)
    private BigDecimal quantidadeEnviada;

    /** Quantidade efetivamente recebida pelo destino (preenchida no aceite) */
    @Column(precision = 19, scale = 3)
    private BigDecimal quantidadeRecebida;
}
