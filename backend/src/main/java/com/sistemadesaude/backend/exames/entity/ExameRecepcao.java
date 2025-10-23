package com.sistemadesaude.backend.exames.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "lab_exame_recepcao")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExameRecepcao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recepcao_id", nullable = false)
    private RecepcaoExame recepcao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exame_id", nullable = false)
    private Exame exame;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "motivo_exame_id")
    private MotivoExame motivoExame;

    @Column(name = "quantidade")
    @Builder.Default
    private Integer quantidade = 1;

    @Column(name = "sessao_numero")
    private Integer sessaoNumero;

    @Column(name = "autorizado")
    @Builder.Default
    private Boolean autorizado = false;

    @Column(name = "numero_autorizacao", length = 50)
    private String numeroAutorizacao;

    @Column(name = "valor_exame", precision = 10, scale = 2)
    private BigDecimal valorExame;

    @Lob
    @Column(name = "observacoes")
    private String observacoes;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    @Builder.Default
    private StatusExameRecepcao status = StatusExameRecepcao.AGUARDANDO_COLETA;

    public enum StatusExameRecepcao {
        AGUARDANDO_COLETA,
        COLETADO,
        EM_ANALISE,
        RESULTADO_DIGITADO,
        ASSINADO,
        ENTREGUE,
        CANCELADO
    }
}