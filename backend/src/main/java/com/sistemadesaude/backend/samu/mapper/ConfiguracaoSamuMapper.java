package com.sistemadesaude.backend.samu.mapper;

import com.sistemadesaude.backend.samu.dto.ConfiguracaoSamuDTO;
import com.sistemadesaude.backend.samu.dto.ConfiguracaoSamuRequestDTO;
import com.sistemadesaude.backend.samu.entity.ConfiguracaoSamu;
import com.sistemadesaude.backend.unidadesaude.entity.UnidadeSaude;
import org.springframework.stereotype.Component;

/**
 * Mapper para ConfiguracaoSamu
 */
@Component
public class ConfiguracaoSamuMapper {

    public ConfiguracaoSamuDTO toDTO(ConfiguracaoSamu entity) {
        if (entity == null) {
            return null;
        }

        return ConfiguracaoSamuDTO.builder()
                .id(entity.getId())
                .unidadeId(entity.getUnidade() != null ? entity.getUnidade().getId() : null)
                .unidadeNome(entity.getUnidade() != null ? entity.getUnidade().getNome() : null)
                .informarTipoOcorrencia(entity.getInformarTipoOcorrencia())
                .informarTipoSolicitante(entity.getInformarTipoSolicitante())
                .informarTipoLigacao(entity.getInformarTipoLigacao())
                .tipoLigacaoPadrao(entity.getTipoLigacaoPadrao())
                .informarOrigemSolicitacao(entity.getInformarOrigemSolicitacao())
                .informarUsuarioSolicitacao(entity.getInformarUsuarioSolicitacao())
                .situacaoAmbIniciarEtapa(entity.getSituacaoAmbIniciarEtapa())
                .situacaoAmbEncerrarEtapa(entity.getSituacaoAmbEncerrarEtapa())
                .periodoSolicitacoesSamu(entity.getPeriodoSolicitacoesSamu())
                .periodoAtendimentoSolicitacoes(entity.getPeriodoAtendimentoSolicitacoes())
                .periodoSolicitacoesAmbulancia(entity.getPeriodoSolicitacoesAmbulancia())
                .recargaSolicitacoesSamu(entity.getRecargaSolicitacoesSamu())
                .recargaAtendimentoSolicitacoes(entity.getRecargaAtendimentoSolicitacoes())
                .recargaSolicitacoesAmbulancia(entity.getRecargaSolicitacoesAmbulancia())
                .dataCriacao(entity.getDataCriacao())
                .dataAtualizacao(entity.getDataAtualizacao())
                .build();
    }

    public ConfiguracaoSamu toEntity(ConfiguracaoSamuRequestDTO dto, UnidadeSaude unidade) {
        if (dto == null) {
            return null;
        }

        return ConfiguracaoSamu.builder()
                .unidade(unidade)
                .informarTipoOcorrencia(dto.getInformarTipoOcorrencia())
                .informarTipoSolicitante(dto.getInformarTipoSolicitante())
                .informarTipoLigacao(dto.getInformarTipoLigacao())
                .tipoLigacaoPadrao(dto.getTipoLigacaoPadrao())
                .informarOrigemSolicitacao(dto.getInformarOrigemSolicitacao())
                .informarUsuarioSolicitacao(dto.getInformarUsuarioSolicitacao())
                .situacaoAmbIniciarEtapa(dto.getSituacaoAmbIniciarEtapa())
                .situacaoAmbEncerrarEtapa(dto.getSituacaoAmbEncerrarEtapa())
                .periodoSolicitacoesSamu(dto.getPeriodoSolicitacoesSamu())
                .periodoAtendimentoSolicitacoes(dto.getPeriodoAtendimentoSolicitacoes())
                .periodoSolicitacoesAmbulancia(dto.getPeriodoSolicitacoesAmbulancia())
                .recargaSolicitacoesSamu(dto.getRecargaSolicitacoesSamu())
                .recargaAtendimentoSolicitacoes(dto.getRecargaAtendimentoSolicitacoes())
                .recargaSolicitacoesAmbulancia(dto.getRecargaSolicitacoesAmbulancia())
                .build();
    }

    public void updateEntity(ConfiguracaoSamuRequestDTO dto, ConfiguracaoSamu entity) {
        if (dto == null || entity == null) {
            return;
        }

        if (dto.getInformarTipoOcorrencia() != null) {
            entity.setInformarTipoOcorrencia(dto.getInformarTipoOcorrencia());
        }
        if (dto.getInformarTipoSolicitante() != null) {
            entity.setInformarTipoSolicitante(dto.getInformarTipoSolicitante());
        }
        if (dto.getInformarTipoLigacao() != null) {
            entity.setInformarTipoLigacao(dto.getInformarTipoLigacao());
        }
        if (dto.getTipoLigacaoPadrao() != null) {
            entity.setTipoLigacaoPadrao(dto.getTipoLigacaoPadrao());
        }
        if (dto.getInformarOrigemSolicitacao() != null) {
            entity.setInformarOrigemSolicitacao(dto.getInformarOrigemSolicitacao());
        }
        if (dto.getInformarUsuarioSolicitacao() != null) {
            entity.setInformarUsuarioSolicitacao(dto.getInformarUsuarioSolicitacao());
        }
        if (dto.getSituacaoAmbIniciarEtapa() != null) {
            entity.setSituacaoAmbIniciarEtapa(dto.getSituacaoAmbIniciarEtapa());
        }
        if (dto.getSituacaoAmbEncerrarEtapa() != null) {
            entity.setSituacaoAmbEncerrarEtapa(dto.getSituacaoAmbEncerrarEtapa());
        }
        if (dto.getPeriodoSolicitacoesSamu() != null) {
            entity.setPeriodoSolicitacoesSamu(dto.getPeriodoSolicitacoesSamu());
        }
        if (dto.getPeriodoAtendimentoSolicitacoes() != null) {
            entity.setPeriodoAtendimentoSolicitacoes(dto.getPeriodoAtendimentoSolicitacoes());
        }
        if (dto.getPeriodoSolicitacoesAmbulancia() != null) {
            entity.setPeriodoSolicitacoesAmbulancia(dto.getPeriodoSolicitacoesAmbulancia());
        }
        if (dto.getRecargaSolicitacoesSamu() != null) {
            entity.setRecargaSolicitacoesSamu(dto.getRecargaSolicitacoesSamu());
        }
        if (dto.getRecargaAtendimentoSolicitacoes() != null) {
            entity.setRecargaAtendimentoSolicitacoes(dto.getRecargaAtendimentoSolicitacoes());
        }
        if (dto.getRecargaSolicitacoesAmbulancia() != null) {
            entity.setRecargaSolicitacoesAmbulancia(dto.getRecargaSolicitacoesAmbulancia());
        }
    }
}
