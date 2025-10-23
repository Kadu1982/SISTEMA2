package com.sistemadesaude.backend.samu.service;

import com.sistemadesaude.backend.exception.BusinessException;
import com.sistemadesaude.backend.exception.ResourceNotFoundException;
import com.sistemadesaude.backend.samu.dto.ConfiguracaoSamuDTO;
import com.sistemadesaude.backend.samu.dto.ConfiguracaoSamuRequestDTO;
import com.sistemadesaude.backend.samu.entity.ConfiguracaoSamu;
import com.sistemadesaude.backend.samu.mapper.ConfiguracaoSamuMapper;
import com.sistemadesaude.backend.samu.repository.ConfiguracaoSamuRepository;
import com.sistemadesaude.backend.unidadesaude.entity.UnidadeSaude;
import com.sistemadesaude.backend.unidadesaude.repository.UnidadeSaudeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service para gerenciar Configurações do Módulo SAMU
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ConfiguracaoSamuService {

    private final ConfiguracaoSamuRepository configuracaoRepository;
    private final UnidadeSaudeRepository unidadeSaudeRepository;
    private final ConfiguracaoSamuMapper mapper;

    /**
     * Busca configuração por unidade de saúde
     * Se não existir, cria configuração padrão
     */
    @Transactional
    public ConfiguracaoSamuDTO buscarPorUnidade(Long unidadeId) {
        log.info("Buscando configuração SAMU para unidade: {}", unidadeId);

        // Verifica se a unidade existe
        UnidadeSaude unidade = unidadeSaudeRepository.findById(unidadeId)
                .orElseThrow(() -> new ResourceNotFoundException("Unidade de saúde não encontrada: " + unidadeId));

        // Busca ou cria configuração
        ConfiguracaoSamu config = configuracaoRepository.findByUnidade_Id(unidadeId)
                .orElseGet(() -> criarConfiguracaoPadrao(unidade));

        return mapper.toDTO(config);
    }

    /**
     * Salva ou atualiza configuração
     */
    @Transactional
    public ConfiguracaoSamuDTO salvarConfiguracao(ConfiguracaoSamuRequestDTO request) {
        log.info("Salvando configuração SAMU para unidade: {}", request.getUnidadeId());

        // Valida unidade
        UnidadeSaude unidade = unidadeSaudeRepository.findById(request.getUnidadeId())
                .orElseThrow(() -> new ResourceNotFoundException("Unidade de saúde não encontrada: " + request.getUnidadeId()));

        // Busca configuração existente ou cria nova
        ConfiguracaoSamu config = configuracaoRepository.findByUnidade_Id(request.getUnidadeId())
                .orElse(null);

        if (config == null) {
            // Criar nova configuração
            config = mapper.toEntity(request, unidade);
        } else {
            // Atualizar configuração existente
            mapper.updateEntity(request, config);
        }

        // Validações de negócio
        validarConfiguracao(config);

        // Salva no banco
        ConfiguracaoSamu saved = configuracaoRepository.save(config);
        log.info("Configuração SAMU salva com sucesso - ID: {}", saved.getId());

        return mapper.toDTO(saved);
    }

    /**
     * Cria configuração padrão para uma unidade
     */
    @Transactional
    public ConfiguracaoSamu criarConfiguracaoPadrao(UnidadeSaude unidade) {
        log.info("Criando configuração padrão SAMU para unidade: {}", unidade.getId());

        // Verifica se já existe
        if (configuracaoRepository.existsByUnidade_Id(unidade.getId())) {
            throw new BusinessException("Já existe configuração para esta unidade");
        }

        ConfiguracaoSamu config = ConfiguracaoSamu.builder()
                .unidade(unidade)
                .informarTipoOcorrencia(ConfiguracaoSamu.CampoObrigatoriedade.NAO_OBRIGATORIO)
                .informarTipoSolicitante(ConfiguracaoSamu.CampoObrigatoriedade.NAO_OBRIGATORIO)
                .informarTipoLigacao(ConfiguracaoSamu.CampoObrigatoriedade.NAO_OBRIGATORIO)
                .informarOrigemSolicitacao(ConfiguracaoSamu.CampoObrigatoriedade.NAO_OBRIGATORIO)
                .informarUsuarioSolicitacao(true)
                .periodoSolicitacoesSamu(30)
                .periodoAtendimentoSolicitacoes(30)
                .periodoSolicitacoesAmbulancia(30)
                .recargaSolicitacoesSamu(30)
                .recargaAtendimentoSolicitacoes(30)
                .recargaSolicitacoesAmbulancia(30)
                .build();

        ConfiguracaoSamu saved = configuracaoRepository.save(config);
        log.info("Configuração padrão criada com sucesso - ID: {}", saved.getId());

        return saved;
    }

    /**
     * Deleta configuração
     */
    @Transactional
    public void deletarConfiguracao(Long unidadeId) {
        log.info("Deletando configuração SAMU para unidade: {}", unidadeId);

        ConfiguracaoSamu config = configuracaoRepository.findByUnidade_Id(unidadeId)
                .orElseThrow(() -> new ResourceNotFoundException("Configuração não encontrada para unidade: " + unidadeId));

        configuracaoRepository.delete(config);
        log.info("Configuração SAMU deletada com sucesso");
    }

    /**
     * Valida regras de negócio da configuração
     */
    private void validarConfiguracao(ConfiguracaoSamu config) {
        // Valida períodos mínimos
        if (config.getPeriodoSolicitacoesSamu() != null && config.getPeriodoSolicitacoesSamu() < 1) {
            throw new BusinessException("Período de solicitações SAMU deve ser maior que 0");
        }
        if (config.getPeriodoAtendimentoSolicitacoes() != null && config.getPeriodoAtendimentoSolicitacoes() < 1) {
            throw new BusinessException("Período de atendimento deve ser maior que 0");
        }
        if (config.getPeriodoSolicitacoesAmbulancia() != null && config.getPeriodoSolicitacoesAmbulancia() < 1) {
            throw new BusinessException("Período de solicitações de ambulância deve ser maior que 0");
        }

        // Valida recargas mínimas
        if (config.getRecargaSolicitacoesSamu() != null && config.getRecargaSolicitacoesSamu() < 1) {
            throw new BusinessException("Recarga de solicitações SAMU deve ser maior que 0");
        }
        if (config.getRecargaAtendimentoSolicitacoes() != null && config.getRecargaAtendimentoSolicitacoes() < 1) {
            throw new BusinessException("Recarga de atendimento deve ser maior que 0");
        }
        if (config.getRecargaSolicitacoesAmbulancia() != null && config.getRecargaSolicitacoesAmbulancia() < 1) {
            throw new BusinessException("Recarga de solicitações de ambulância deve ser maior que 0");
        }
    }
}
