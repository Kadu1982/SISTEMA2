package com.sistemadesaude.backend.estoque.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "est_entrada_item")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class EntradaItem {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false) private Entrada entrada;
    @ManyToOne(optional = false) private Lote lote;

    @Column(nullable = false, precision = 19, scale = 3)
    private BigDecimal quantidade;

    @Column(precision = 19, scale = 6)
    private BigDecimal valorUnitario;

    /** Localização física informada no item (ajuda na emissão de etiquetas e picking) */
    private String localizacaoFisica;
}
