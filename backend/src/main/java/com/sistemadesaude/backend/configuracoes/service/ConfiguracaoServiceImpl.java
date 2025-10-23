package com.sistemadesaude.backend.configuracoes.service;

import com.sistemadesaude.backend.configuracoes.dto.ConfiguracaoDTO;
import com.sistemadesaude.backend.configuracoes.mapper.ConfiguracaoMapper;
import com.sistemadesaude.backend.configuracoes.entity.Configuracao;
import com.sistemadesaude.backend.configuracoes.repository.ConfiguracaoRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Implementação do serviço de configurações do sistema
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ConfiguracaoServiceImpl implements ConfiguracaoService {

    private final ConfiguracaoRepository configuracaoRepository;
    private final ConfiguracaoMapper configuracaoMapper;

    @Override
    @Transactional(readOnly = true)
    public List<ConfiguracaoDTO> listarTodas() {
        log.debug("Listando todas as configurações");
        return configuracaoMapper.toDTOList(configuracaoRepository.findAll());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConfiguracaoDTO> listarPorGrupo(String grupo) {
        log.debug("Listando configurações do grupo: {}", grupo);
        return configuracaoMapper.toDTOList(configuracaoRepository.findByGrupoOrderByChaveAsc(grupo));
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, String> buscarMapaPorGrupo(String grupo) {
        log.debug("Buscando mapa de configurações do grupo: {}", grupo);
        List<Configuracao> configuracoes = configuracaoRepository.findByGrupoOrderByChaveAsc(grupo);
        
        Map<String, String> mapa = new HashMap<>();
        for (Configuracao configuracao : configuracoes) {
            mapa.put(configuracao.getChave(), configuracao.getValor());
        }
        
        return mapa;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ConfiguracaoDTO> buscarPorChave(String chave) {
        log.debug("Buscando configuração pela chave: {}", chave);
        return configuracaoRepository.findById(chave)
                .map(configuracaoMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public String buscarValor(String chave, String valorPadrao) {
        log.debug("Buscando valor da configuração pela chave: {}", chave);
        return configuracaoRepository.findById(chave)
                .map(Configuracao::getValor)
                .orElse(valorPadrao);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConfiguracaoDTO> buscarPorChaveContendo(String texto) {
        log.debug("Buscando configurações com chave contendo: {}", texto);
        return configuracaoMapper.toDTOList(
                configuracaoRepository.findByChaveContainingIgnoreCaseOrderByChaveAsc(texto));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConfiguracaoDTO> buscarPorGrupoEChaveContendo(String grupo, String texto) {
        log.debug("Buscando configurações do grupo {} com chave contendo: {}", grupo, texto);
        return configuracaoMapper.toDTOList(
                configuracaoRepository.findByGrupoAndChaveContainingIgnoreCaseOrderByChaveAsc(grupo, texto));
    }

    @Override
    public ConfiguracaoDTO salvar(ConfiguracaoDTO configuracaoDTO) {
        log.debug("Salvando configuração: {}", configuracaoDTO);
        
        // Obtém o usuário atual para auditoria
        String usuarioAtual = getUsuarioAtual();
        
        // Configura dados de auditoria
        if (configuracaoDTO.getCriadoPor() == null) {
            configuracaoDTO.setCriadoPor(usuarioAtual);
        }
        configuracaoDTO.setAtualizadoPor(usuarioAtual);
        
        // Converte para entidade e salva
        Configuracao configuracao = configuracaoMapper.toEntity(configuracaoDTO);
        Configuracao configuracaoSalva = configuracaoRepository.save(configuracao);
        
        return configuracaoMapper.toDTO(configuracaoSalva);
    }

    @Override
    public List<ConfiguracaoDTO> salvarTodas(List<ConfiguracaoDTO> configuracoes) {
        log.debug("Salvando {} configurações", configuracoes.size());
        
        // Obtém o usuário atual para auditoria
        String usuarioAtual = getUsuarioAtual();
        
        // Configura dados de auditoria para cada configuração
        configuracoes.forEach(dto -> {
            if (dto.getCriadoPor() == null) {
                dto.setCriadoPor(usuarioAtual);
            }
            dto.setAtualizadoPor(usuarioAtual);
        });
        
        // Converte para entidades e salva
        List<Configuracao> entidades = configuracaoMapper.toEntityList(configuracoes);
        List<Configuracao> entidadesSalvas = configuracaoRepository.saveAll(entidades);
        
        return configuracaoMapper.toDTOList(entidadesSalvas);
    }

    @Override
    public ConfiguracaoDTO atualizar(String chave, ConfiguracaoDTO configuracaoDTO) throws EntityNotFoundException {
        log.debug("Atualizando configuração com chave: {}", chave);
        
        // Verifica se a configuração existe
        Configuracao configuracaoExistente = configuracaoRepository.findById(chave)
                .orElseThrow(() -> new EntityNotFoundException("Configuração não encontrada com a chave: " + chave));
        
        // Obtém o usuário atual para auditoria
        String usuarioAtual = getUsuarioAtual();
        configuracaoDTO.setAtualizadoPor(usuarioAtual);
        
        // Atualiza a entidade com os dados do DTO
        Configuracao configuracaoAtualizada = configuracaoMapper.updateEntityFromDTO(configuracaoExistente, configuracaoDTO);
        
        // Salva a entidade atualizada
        configuracaoAtualizada = configuracaoRepository.save(configuracaoAtualizada);
        
        return configuracaoMapper.toDTO(configuracaoAtualizada);
    }

    @Override
    public void excluir(String chave) throws EntityNotFoundException {
        log.debug("Excluindo configuração com chave: {}", chave);
        
        // Verifica se a configuração existe
        if (!configuracaoRepository.existsById(chave)) {
            throw new EntityNotFoundException("Configuração não encontrada com a chave: " + chave);
        }
        
        configuracaoRepository.deleteById(chave);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> listarGrupos() {
        log.debug("Listando todos os grupos de configurações");
        return configuracaoRepository.findAllGroups();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConfiguracaoDTO> listarEditaveis() {
        log.debug("Listando configurações editáveis");
        return configuracaoMapper.toDTOList(configuracaoRepository.findByEditavelTrueOrderByGrupoAscChaveAsc());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConfiguracaoDTO> listarPorGrupoEEditavel(String grupo, Boolean editavel) {
        log.debug("Listando configurações do grupo {} com editável={}", grupo, editavel);
        return configuracaoMapper.toDTOList(configuracaoRepository.findByGrupoAndEditavelOrderByChaveAsc(grupo, editavel));
    }

    /**
     * Obtém o nome do usuário autenticado atual
     * @return Nome do usuário ou "sistema" se não houver usuário autenticado
     */
    private String getUsuarioAtual() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName();
        }
        return "sistema";
    }
}
