package com.sistemadesaude.backend.exames.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Entidade para Solicitação de Auxílio Diagnóstico e Terapêutico (SADT)
 */
@Entity
@Table(name = "sadt")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sadt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_sadt", unique = true, nullable = false, length = 20)
    private String numeroSadt;

    @Column(name = "agendamento_id")
    private Long agendamentoId;

    @Column(name = "paciente_id", nullable = false)
    private Long pacienteId;

    @Column(name = "data_emissao", nullable = false)
    private LocalDateTime dataEmissao;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_sadt", nullable = false, length = 20)
    private TipoSadt tipoSadt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private StatusSadt status = StatusSadt.GERADA;

    @Column(name = "operador", nullable = false, length = 100)
    private String operador;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "urgente", nullable = false)
    @Builder.Default
    private Boolean urgente = false;

    // ✅ Dados do estabelecimento
    @Column(name = "estabelecimento_nome", nullable = false, length = 200)
    private String estabelecimentoNome;

    @Column(name = "estabelecimento_cnes", nullable = false, length = 10)
    private String estabelecimentoCnes;

    @Column(name = "estabelecimento_endereco", length = 300)
    private String estabelecimentoEndereco;

    @Column(name = "estabelecimento_telefone", length = 20)
    private String estabelecimentoTelefone;

    @Column(name = "estabelecimento_municipio", length = 100)
    private String estabelecimentoMunicipio;

    @Column(name = "estabelecimento_uf", length = 2)
    private String estabelecimentoUf;

    // ✅ Dados do solicitante
    @Column(name = "solicitante_nome", nullable = false, length = 200)
    private String solicitanteNome;

    @Column(name = "solicitante_cbo", length = 10)
    private String solicitanteCbo;

    @Column(name = "solicitante_conselho", length = 10)
    private String solicitanteConselho;

    @Column(name = "solicitante_numero_conselho", length = 20)
    private String solicitanteNumeroConselho;

    // ✅ PDF gerado
    @Lob
    @Column(name = "pdf_base64", columnDefinition = "TEXT")
    private String pdfBase64;

    // ✅ Código de barras
    @Column(name = "codigo_barras", unique = true, length = 50)
    private String codigoBarras;

    @Lob
    @Column(name = "codigo_barras_imagem")
    private byte[] codigoBarrasImagem;

    // ✅ Relacionamento com procedimentos
    @OneToMany(mappedBy = "sadt", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ProcedimentoSadt> procedimentos;

    // ✅ Auditoria
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // ✅ Enums
    public enum TipoSadt {
        LABORATORIAL("laboratorial"),
        IMAGEM("imagem"),
        TERAPEUTICO("terapeutico");

        private final String valor;

        TipoSadt(String valor) {
            this.valor = valor;
        }

        public String getValor() {
            return valor;
        }

        public static TipoSadt fromString(String valor) {
            for (TipoSadt tipo : TipoSadt.values()) {
                if (tipo.valor.equalsIgnoreCase(valor)) {
                    return tipo;
                }
            }
            throw new IllegalArgumentException("Tipo SADT inválido: " + valor);
        }
    }

    public enum StatusSadt {
        GERADA("GERADA"),
        CANCELADA("CANCELADA"),
        REALIZADA("REALIZADA");

        private final String valor;

        StatusSadt(String valor) {
            this.valor = valor;
        }

        public String getValor() {
            return valor;
        }
    }

    // ✅ Métodos auxiliares
    @PrePersist
    public void prePersist() {
        if (dataEmissao == null) {
            dataEmissao = LocalDateTime.now();
        }
        if (status == null) {
            status = StatusSadt.GERADA;
        }
        if (urgente == null) {
            urgente = false;
        }
    }

    public boolean isAtiva() {
        return StatusSadt.GERADA.equals(status);
    }

    public boolean isCancelada() {
        return StatusSadt.CANCELADA.equals(status);
    }

    public boolean isRealizada() {
        return StatusSadt.REALIZADA.equals(status);
    }

    public int getTotalProcedimentos() {
        return procedimentos != null ? procedimentos.size() : 0;
    }
}
