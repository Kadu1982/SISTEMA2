package com.sistemadesaude.backend.samu.entity;

import com.sistemadesaude.backend.unidadesaude.entity.UnidadeSaude;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 🔧 CONFIGURAÇÃO DO MÓDULO SAMU
 *
 * Define configurações personalizadas do módulo SAMU
 * para cada unidade de saúde
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "samu_configuracao")
public class ConfiguracaoSamu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidade_id", unique = true, nullable = false)
    private UnidadeSaude unidade;

    // ========================================
    // 📋 CAMPOS DE SOLICITAÇÃO
    // ========================================

    @Enumerated(EnumType.STRING)
    @Column(name = "informar_tipo_ocorrencia")
    private CampoObrigatoriedade informarTipoOcorrencia = CampoObrigatoriedade.NAO_OBRIGATORIO;

    @Enumerated(EnumType.STRING)
    @Column(name = "informar_tipo_solicitante")
    private CampoObrigatoriedade informarTipoSolicitante = CampoObrigatoriedade.NAO_OBRIGATORIO;

    @Enumerated(EnumType.STRING)
    @Column(name = "informar_tipo_ligacao")
    private CampoObrigatoriedade informarTipoLigacao = CampoObrigatoriedade.NAO_OBRIGATORIO;

    @Column(name = "tipo_ligacao_padrao")
    private Long tipoLigacaoPadrao;

    @Enumerated(EnumType.STRING)
    @Column(name = "informar_origem_solicitacao")
    private CampoObrigatoriedade informarOrigemSolicitacao = CampoObrigatoriedade.NAO_OBRIGATORIO;

    @Column(name = "informar_usuario_solicitacao")
    private Boolean informarUsuarioSolicitacao = true;

    // ========================================
    // 🚑 SITUAÇÕES PADRÃO
    // ========================================

    @Column(name = "situacao_amb_iniciar_etapa")
    private Long situacaoAmbIniciarEtapa;

    @Column(name = "situacao_amb_encerrar_etapa")
    private Long situacaoAmbEncerrarEtapa;

    // ========================================
    // 📅 PERÍODOS DOS ESTÁGIOS (DIAS)
    // ========================================

    @Column(name = "periodo_solicitacoes_samu")
    private Integer periodoSolicitacoesSamu = 30;

    @Column(name = "periodo_atendimento_solicitacoes")
    private Integer periodoAtendimentoSolicitacoes = 30;

    @Column(name = "periodo_solicitacoes_ambulancia")
    private Integer periodoSolicitacoesAmbulancia = 30;

    // ========================================
    // 🔄 PERÍODOS DE RECARGA (SEGUNDOS)
    // ========================================

    @Column(name = "recarga_solicitacoes_samu")
    private Integer recargaSolicitacoesSamu = 30;

    @Column(name = "recarga_atendimento_solicitacoes")
    private Integer recargaAtendimentoSolicitacoes = 30;

    @Column(name = "recarga_solicitacoes_ambulancia")
    private Integer recargaSolicitacoesAmbulancia = 30;

    // ========================================
    // 📅 DADOS DE CONTROLE
    // ========================================

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @PrePersist
    private void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (this.dataCriacao == null) {
            this.dataCriacao = now;
        }
        this.dataAtualizacao = now;
    }

    @PreUpdate
    private void preUpdate() {
        this.dataAtualizacao = LocalDateTime.now();
    }

    // ========================================
    // 📊 ENUM DE OBRIGATORIEDADE
    // ========================================

    public enum CampoObrigatoriedade {
        NAO("Não informar"),
        OBRIGATORIO("Obrigatório"),
        NAO_OBRIGATORIO("Não obrigatório");

        private final String descricao;

        CampoObrigatoriedade(String descricao) {
            this.descricao = descricao;
        }

        public String getDescricao() {
            return descricao;
        }
    }
}
