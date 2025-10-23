package com.sistemadesaude.backend.exames.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "procedimento_sadt")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcedimentoSadt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo_sigtap", nullable = false, length = 20)
    private String codigoSigtap;

    @Column(name = "nome_procedimento", nullable = false, length = 500)
    private String nomeProcedimento;

    @Column(nullable = false)
    private Integer quantidade;

    @Column(length = 10)
    private String cid10;

    // ✅ CORREÇÃO: Usando @Lob ao invés de columnDefinition = "TEXT"
    @Lob
    @Column(name = "justificativa")
    private String justificativa;

    // ✅ CORREÇÃO: Usando @Lob ao invés de columnDefinition = "TEXT"
    @Lob
    @Column(name = "preparo")
    private String preparo;

    @Column(name = "valor_sus", precision = 10, scale = 2)
    private BigDecimal valorSus;

    @Column(nullable = false)
    private Boolean autorizado = false;

    @Column(nullable = false)
    private Boolean executado = false;

    @Column(name = "data_execucao")
    private LocalDateTime dataExecucao;

    // ✅ CORREÇÃO: Usando @Lob ao invés de columnDefinition = "TEXT"
    @Lob
    @Column(name = "observacoes_execucao")
    private String observacoesExecucao;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm;

    @Column(name = "criado_por", length = 100)
    private String criadoPor;

    // Relacionamento com SADT
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sadt_id", nullable = false)
    private Sadt sadt;

    @PrePersist
    public void prePersist() {
        this.criadoEm = LocalDateTime.now();
        if (this.autorizado == null) {
            this.autorizado = false;
        }
        if (this.executado == null) {
            this.executado = false;
        }
    }
}
