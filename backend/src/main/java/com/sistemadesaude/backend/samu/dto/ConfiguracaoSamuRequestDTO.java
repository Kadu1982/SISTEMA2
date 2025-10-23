package com.sistemadesaude.backend.samu.dto;

import com.sistemadesaude.backend.samu.entity.ConfiguracaoSamu.CampoObrigatoriedade;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de Request para Salvar Configuração do Módulo SAMU
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConfiguracaoSamuRequestDTO {

    @NotNull(message = "ID da unidade é obrigatório")
    private Long unidadeId;

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
    @Min(value = 1, message = "Período mínimo de 1 dia")
    private Integer periodoSolicitacoesSamu;

    @Min(value = 1, message = "Período mínimo de 1 dia")
    private Integer periodoAtendimentoSolicitacoes;

    @Min(value = 1, message = "Período mínimo de 1 dia")
    private Integer periodoSolicitacoesAmbulancia;

    // Períodos de Recarga (Segundos)
    @Min(value = 1, message = "Período de recarga mínimo de 1 segundo")
    private Integer recargaSolicitacoesSamu;

    @Min(value = 1, message = "Período de recarga mínimo de 1 segundo")
    private Integer recargaAtendimentoSolicitacoes;

    @Min(value = 1, message = "Período de recarga mínimo de 1 segundo")
    private Integer recargaSolicitacoesAmbulancia;
}
