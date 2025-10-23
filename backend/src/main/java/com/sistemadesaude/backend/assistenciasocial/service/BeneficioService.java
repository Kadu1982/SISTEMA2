package com.sistemadesaude.backend.assistenciasocial.service;

import com.sistemadesaude.backend.assistenciasocial.entity.Beneficio;
import com.sistemadesaude.backend.assistenciasocial.entity.TipoBeneficio;
import com.sistemadesaude.backend.assistenciasocial.repository.BeneficioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Serviço para gerenciar os benefícios no módulo de Assistência Social.
 */
@Service
public class BeneficioService {

    private final BeneficioRepository beneficioRepository;

    @Autowired
    public BeneficioService(BeneficioRepository beneficioRepository) {
        this.beneficioRepository = beneficioRepository;
    }

    /**
     * Busca todos os benefícios.
     * @return Lista de todos os benefícios.
     */
    @Transactional(readOnly = true)
    public List<Beneficio> buscarTodos() {
        return beneficioRepository.findAll();
    }

    /**
     * Busca todos os benefícios com paginação.
     * @param pageable Informações de paginação.
     * @return Página de benefícios.
     */
    @Transactional(readOnly = true)
    public Page<Beneficio> buscarTodos(Pageable pageable) {
        return beneficioRepository.findAll(pageable);
    }

    /**
     * Busca um benefício pelo ID.
     * @param id ID do benefício.
     * @return O benefício encontrado.
     */
    @Transactional(readOnly = true)
    public Optional<Beneficio> buscarPorId(Long id) {
        return beneficioRepository.findById(id);
    }

    /**
     * Busca um benefício pelo nome.
     * @param nome Nome do benefício.
     * @return O benefício encontrado.
     */
    @Transactional(readOnly = true)
    public Optional<Beneficio> buscarPorNome(String nome) {
        return beneficioRepository.findByNome(nome);
    }

    /**
     * Busca benefícios pelo nome contendo o texto informado.
     * @param nome Texto a ser buscado no nome do benefício.
     * @param pageable Informações de paginação.
     * @return Página de benefícios encontrados.
     */
    @Transactional(readOnly = true)
    public Page<Beneficio> buscarPorNomeContendo(String nome, Pageable pageable) {
        return beneficioRepository.findByNomeContainingIgnoreCase(nome, pageable);
    }

    /**
     * Busca benefícios ativos.
     * @return Lista de benefícios ativos.
     */
    @Transactional(readOnly = true)
    public List<Beneficio> buscarAtivos() {
        return beneficioRepository.findByAtivoTrue();
    }

    /**
     * Busca benefícios ativos com paginação.
     * @param pageable Informações de paginação.
     * @return Página de benefícios ativos.
     */
    @Transactional(readOnly = true)
    public Page<Beneficio> buscarAtivos(Pageable pageable) {
        return beneficioRepository.findByAtivoTrue(pageable);
    }

    /**
     * Busca benefícios por tipo de benefício.
     * @param tipoBeneficio O tipo de benefício.
     * @return Lista de benefícios do tipo especificado.
     */
    @Transactional(readOnly = true)
    public List<Beneficio> buscarPorTipo(TipoBeneficio tipoBeneficio) {
        return beneficioRepository.findByTipoBeneficio(tipoBeneficio);
    }

    /**
     * Busca benefícios por tipo de benefício com paginação.
     * @param tipoBeneficio O tipo de benefício.
     * @param pageable Informações de paginação.
     * @return Página de benefícios do tipo especificado.
     */
    @Transactional(readOnly = true)
    public Page<Beneficio> buscarPorTipo(TipoBeneficio tipoBeneficio, Pageable pageable) {
        return beneficioRepository.findByTipoBeneficio(tipoBeneficio, pageable);
    }

    /**
     * Busca benefícios ativos por tipo de benefício.
     * @param tipoBeneficio O tipo de benefício.
     * @return Lista de benefícios ativos do tipo especificado.
     */
    @Transactional(readOnly = true)
    public List<Beneficio> buscarAtivosPorTipo(TipoBeneficio tipoBeneficio) {
        return beneficioRepository.findByTipoBeneficioAndAtivoTrue(tipoBeneficio);
    }

    /**
     * Salva um benefício.
     * @param beneficio Benefício a ser salvo.
     * @param usuarioCadastro O usuário que está realizando o cadastro.
     * @return O benefício salvo.
     */
    @Transactional
    public Beneficio salvar(Beneficio beneficio, String usuarioCadastro) {
        boolean isNovo = beneficio.getId() == null;
        
        // Verifica se já existe um benefício com o mesmo nome
        if (isNovo) {
            Optional<Beneficio> existente = beneficioRepository.findByNome(beneficio.getNome());
            if (existente.isPresent()) {
                throw new IllegalArgumentException("Já existe um benefício com o nome informado.");
            }
            
            beneficio.setDataCadastro(LocalDateTime.now());
            beneficio.setUsuarioCadastro(usuarioCadastro);
        }
        
        beneficio.setDataAtualizacao(LocalDateTime.now());
        beneficio.setUsuarioAtualizacao(usuarioCadastro);
        
        return beneficioRepository.save(beneficio);
    }

    /**
     * Ativa um benefício.
     * @param id ID do benefício.
     * @param usuarioAtualizacao O usuário que está realizando a atualização.
     * @return O benefício ativado.
     */
    @Transactional
    public Beneficio ativar(Long id, String usuarioAtualizacao) {
        Beneficio beneficio = beneficioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Benefício não encontrado."));
        
        beneficio.setAtivo(true);
        beneficio.setDataAtualizacao(LocalDateTime.now());
        beneficio.setUsuarioAtualizacao(usuarioAtualizacao);
        
        return beneficioRepository.save(beneficio);
    }

    /**
     * Inativa um benefício.
     * @param id ID do benefício.
     * @param usuarioAtualizacao O usuário que está realizando a atualização.
     * @return O benefício inativado.
     */
    @Transactional
    public Beneficio inativar(Long id, String usuarioAtualizacao) {
        Beneficio beneficio = beneficioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Benefício não encontrado."));
        
        beneficio.setAtivo(false);
        beneficio.setDataAtualizacao(LocalDateTime.now());
        beneficio.setUsuarioAtualizacao(usuarioAtualizacao);
        
        return beneficioRepository.save(beneficio);
    }

    /**
     * Exclui um benefício.
     * @param id ID do benefício.
     */
    @Transactional
    public void excluir(Long id) {
        Beneficio beneficio = beneficioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Benefício não encontrado."));
        
        // Aqui poderia ter uma verificação se o benefício está sendo usado
        // em algum lugar antes de excluir
        
        beneficioRepository.delete(beneficio);
    }
}
