package com.sistemadesaude.backend.estoque.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "est_saida_item")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class SaidaItem {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false) private Saida saida;
    @ManyToOne(optional = false) private Lote lote;

    @Column(nullable = false, precision = 19, scale = 3)
    private BigDecimal quantidade;
}
