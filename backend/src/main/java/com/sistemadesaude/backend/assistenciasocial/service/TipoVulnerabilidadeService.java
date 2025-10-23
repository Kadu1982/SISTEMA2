package com.sistemadesaude.backend.assistenciasocial.service;

import com.sistemadesaude.backend.assistenciasocial.entity.TipoVulnerabilidade;
import com.sistemadesaude.backend.assistenciasocial.repository.TipoVulnerabilidadeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Serviço para gerenciar os tipos de vulnerabilidade no módulo de Assistência Social.
 */
@Service
public class TipoVulnerabilidadeService {

    private final TipoVulnerabilidadeRepository tipoVulnerabilidadeRepository;

    @Autowired
    public TipoVulnerabilidadeService(TipoVulnerabilidadeRepository tipoVulnerabilidadeRepository) {
        this.tipoVulnerabilidadeRepository = tipoVulnerabilidadeRepository;
    }

    /**
     * Busca todos os tipos de vulnerabilidade.
     * @return Lista de todos os tipos de vulnerabilidade.
     */
    @Transactional(readOnly = true)
    public List<TipoVulnerabilidade> buscarTodos() {
        return tipoVulnerabilidadeRepository.findAll();
    }

    /**
     * Busca todos os tipos de vulnerabilidade com paginação.
     * @param pageable Informações de paginação.
     * @return Página de tipos de vulnerabilidade.
     */
    @Transactional(readOnly = true)
    public Page<TipoVulnerabilidade> buscarTodos(Pageable pageable) {
        return tipoVulnerabilidadeRepository.findAll(pageable);
    }

    /**
     * Busca um tipo de vulnerabilidade pelo ID.
     * @param id ID do tipo de vulnerabilidade.
     * @return O tipo de vulnerabilidade encontrado.
     */
    @Transactional(readOnly = true)
    public Optional<TipoVulnerabilidade> buscarPorId(Long id) {
        return tipoVulnerabilidadeRepository.findById(id);
    }

    /**
     * Busca um tipo de vulnerabilidade pelo nome.
     * @param nome Nome do tipo de vulnerabilidade.
     * @return O tipo de vulnerabilidade encontrado.
     */
    @Transactional(readOnly = true)
    public Optional<TipoVulnerabilidade> buscarPorNome(String nome) {
        return tipoVulnerabilidadeRepository.findByNome(nome);
    }

    /**
     * Busca tipos de vulnerabilidade pelo nome contendo o texto informado.
     * @param nome Texto a ser buscado no nome do tipo de vulnerabilidade.
     * @param pageable Informações de paginação.
     * @return Página de tipos de vulnerabilidade encontrados.
     */
    @Transactional(readOnly = true)
    public Page<TipoVulnerabilidade> buscarPorNomeContendo(String nome, Pageable pageable) {
        return tipoVulnerabilidadeRepository.findByNomeContainingIgnoreCase(nome, pageable);
    }

    /**
     * Busca tipos de vulnerabilidade ativos.
     * @return Lista de tipos de vulnerabilidade ativos.
     */
    @Transactional(readOnly = true)
    public List<TipoVulnerabilidade> buscarAtivos() {
        return tipoVulnerabilidadeRepository.findByAtivoTrue();
    }

    /**
     * Busca tipos de vulnerabilidade ativos com paginação.
     * @param pageable Informações de paginação.
     * @return Página de tipos de vulnerabilidade ativos.
     */
    @Transactional(readOnly = true)
    public Page<TipoVulnerabilidade> buscarAtivos(Pageable pageable) {
        return tipoVulnerabilidadeRepository.findByAtivoTrue(pageable);
    }

    /**
     * Salva um tipo de vulnerabilidade.
     * @param tipoVulnerabilidade Tipo de vulnerabilidade a ser salvo.
     * @return O tipo de vulnerabilidade salvo.
     */
    @Transactional
    public TipoVulnerabilidade salvar(TipoVulnerabilidade tipoVulnerabilidade) {
        // Verifica se já existe um tipo de vulnerabilidade com o mesmo nome
        if (tipoVulnerabilidade.getId() == null) {
            Optional<TipoVulnerabilidade> existente = tipoVulnerabilidadeRepository.findByNome(tipoVulnerabilidade.getNome());
            if (existente.isPresent()) {
                throw new IllegalArgumentException("Já existe um tipo de vulnerabilidade com o nome informado.");
            }
        }
        
        return tipoVulnerabilidadeRepository.save(tipoVulnerabilidade);
    }

    /**
     * Ativa um tipo de vulnerabilidade.
     * @param id ID do tipo de vulnerabilidade.
     * @return O tipo de vulnerabilidade ativado.
     */
    @Transactional
    public TipoVulnerabilidade ativar(Long id) {
        TipoVulnerabilidade tipoVulnerabilidade = tipoVulnerabilidadeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tipo de vulnerabilidade não encontrado."));
        
        tipoVulnerabilidade.setAtivo(true);
        return tipoVulnerabilidadeRepository.save(tipoVulnerabilidade);
    }

    /**
     * Inativa um tipo de vulnerabilidade.
     * @param id ID do tipo de vulnerabilidade.
     * @return O tipo de vulnerabilidade inativado.
     */
    @Transactional
    public TipoVulnerabilidade inativar(Long id) {
        TipoVulnerabilidade tipoVulnerabilidade = tipoVulnerabilidadeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tipo de vulnerabilidade não encontrado."));
        
        tipoVulnerabilidade.setAtivo(false);
        return tipoVulnerabilidadeRepository.save(tipoVulnerabilidade);
    }

    /**
     * Exclui um tipo de vulnerabilidade.
     * @param id ID do tipo de vulnerabilidade.
     */
    @Transactional
    public void excluir(Long id) {
        TipoVulnerabilidade tipoVulnerabilidade = tipoVulnerabilidadeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tipo de vulnerabilidade não encontrado."));
        
        // Aqui poderia ter uma verificação se o tipo de vulnerabilidade está sendo usado
        // em algum lugar antes de excluir
        
        tipoVulnerabilidadeRepository.delete(tipoVulnerabilidade);
    }
}
