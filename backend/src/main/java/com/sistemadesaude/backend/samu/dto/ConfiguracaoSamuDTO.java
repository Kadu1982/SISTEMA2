package com.sistemadesaude.backend.samu.dto;

import com.sistemadesaude.backend.samu.entity.ConfiguracaoSamu.CampoObrigatoriedade;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para Configuração do Módulo SAMU
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConfiguracaoSamuDTO {

    private Long id;
    private Long unidadeId;
    private String unidadeNome;

    // Campos de Solicitação
    private CampoObrigatoriedade informarTipoOcorrencia;
    private CampoObrigatoriedade informarTipoSolicitante;
    private CampoObrigatoriedade informarTipoLigacao;
    private Long tipoLigacaoPadrao;
    private CampoObrigatoriedade informarOrigemSolicitacao;
    private Boolean informarUsuarioSolicitacao;

    // Situações Padrão
    private Long situacaoAmbIniciarEtapa;
    private Long situacaoAmbEncerrarEtapa;

    // Períodos dos Estágios (Dias)
    private Integer periodoSolicitacoesSamu;
    private Integer periodoAtendimentoSolicitacoes;
    private Integer periodoSolicitacoesAmbulancia;

    // Períodos de Recarga (Segundos)
    private Integer recargaSolicitacoesSamu;
    private Integer recargaAtendimentoSolicitacoes;
    private Integer recargaSolicitacoesAmbulancia;

    // Dados de Controle
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAtualizacao;
}
