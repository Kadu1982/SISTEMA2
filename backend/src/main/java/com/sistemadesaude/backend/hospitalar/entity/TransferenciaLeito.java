package com.sistemadesaude.backend.hospitalar.entity;

import com.sistemadesaude.backend.operador.entity.Operador;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "hospitalar_transferencias_leito")
public class TransferenciaLeito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "internacao_id", nullable = false)
    private Internacao internacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leito_origem_id", nullable = false)
    private Leito leitoOrigem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leito_destino_id", nullable = false)
    private Leito leitoDestino;

    @Column(name = "motivo_transferencia", columnDefinition = "TEXT", nullable = false)
    private String motivoTransferencia;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_transferencia", nullable = false)
    private TipoTransferencia tipoTransferencia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operador_solicitacao_id", nullable = false)
    private Operador operadorSolicitacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operador_autorizacao_id")
    private Operador operadorAutorizacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operador_efetivacao_id")
    private Operador operadorEfetivacao;

    @CreationTimestamp
    @Column(name = "data_solicitacao", nullable = false)
    private LocalDateTime dataSolicitacao;

    @Column(name = "data_autorizacao")
    private LocalDateTime dataAutorizacao;

    @Column(name = "data_efetivacao")
    private LocalDateTime dataEfetivacao;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_transferencia", nullable = false)
    private StatusTransferencia statusTransferencia = StatusTransferencia.SOLICITADA;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "motivo_cancelamento")
    private String motivoCancelamento;

    // Enums

    public enum TipoTransferencia {
        MESMA_ENFERMARIA("Mesma Enfermaria"),
        ENTRE_ENFERMARIAS("Entre Enfermarias"),
        CENTRO_CIRURGICO("Para Centro Cirúrgico"),
        UTI("Para UTI"),
        ISOLAMENTO("Para Isolamento"),
        ALTA_HOSPITALAR("Alta Hospitalar");

        private final String descricao;

        TipoTransferencia(String descricao) {
            this.descricao = descricao;
        }

        public String getDescricao() {
            return descricao;
        }
    }

    public enum StatusTransferencia {
        SOLICITADA("Solicitada"),
        AUTORIZADA("Autorizada"),
        EFETIVADA("Efetivada"),
        CANCELADA("Cancelada"),
        REJEITADA("Rejeitada");

        private final String descricao;

        StatusTransferencia(String descricao) {
            this.descricao = descricao;
        }

        public String getDescricao() {
            return descricao;
        }
    }

    // Métodos auxiliares

    public boolean podeSerEfetivada() {
        return StatusTransferencia.AUTORIZADA.equals(this.statusTransferencia);
    }

    public boolean foiEfetivada() {
        return StatusTransferencia.EFETIVADA.equals(this.statusTransferencia);
    }

    public boolean estaPendente() {
        return StatusTransferencia.SOLICITADA.equals(this.statusTransferencia) ||
               StatusTransferencia.AUTORIZADA.equals(this.statusTransferencia);
    }

    public String getDescricaoCompleta() {
        StringBuilder sb = new StringBuilder();
        sb.append("Transferência ");
        if (leitoOrigem != null) {
            sb.append("de ").append(leitoOrigem.getLocalizacaoCompleta());
        }
        if (leitoDestino != null) {
            sb.append(" para ").append(leitoDestino.getLocalizacaoCompleta());
        }
        sb.append(" - ").append(tipoTransferencia.getDescricao());
        return sb.toString();
    }
}