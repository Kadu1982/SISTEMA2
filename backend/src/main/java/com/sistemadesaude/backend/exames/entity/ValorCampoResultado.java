package com.sistemadesaude.backend.exames.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "lab_valor_campo_resultado")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValorCampoResultado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resultado_id", nullable = false)
    private ResultadoExame resultado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campo_id", nullable = false)
    private CampoExame campo;

    @Column(name = "valor", length = 5000)
    private String valor;

    @Column(name = "valor_numerico")
    private Double valorNumerico;

    @Lob
    @Column(name = "valor_texto")
    private String valorTexto;

    @Column(name = "alterado")
    @Builder.Default
    private Boolean alterado = false; // Fora dos valores de referência
}