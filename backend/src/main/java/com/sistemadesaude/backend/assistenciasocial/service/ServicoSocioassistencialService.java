package com.sistemadesaude.backend.assistenciasocial.service;

import com.sistemadesaude.backend.assistenciasocial.entity.GrupoServicoSocioassistencial;
import com.sistemadesaude.backend.assistenciasocial.entity.ServicoSocioassistencial;
import com.sistemadesaude.backend.assistenciasocial.repository.ServicoSocioassistencialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Serviço para gerenciar os serviços socioassistenciais no módulo de Assistência Social.
 */
@Service
public class ServicoSocioassistencialService {

    private final ServicoSocioassistencialRepository servicoRepository;

    @Autowired
    public ServicoSocioassistencialService(ServicoSocioassistencialRepository servicoRepository) {
        this.servicoRepository = servicoRepository;
    }

    /**
     * Busca todos os serviços socioassistenciais.
     * @return Lista de todos os serviços socioassistenciais.
     */
    @Transactional(readOnly = true)
    public List<ServicoSocioassistencial> buscarTodos() {
        return servicoRepository.findAll();
    }

    /**
     * Busca todos os serviços socioassistenciais com paginação.
     * @param pageable Informações de paginação.
     * @return Página de serviços socioassistenciais.
     */
    @Transactional(readOnly = true)
    public Page<ServicoSocioassistencial> buscarTodos(Pageable pageable) {
        return servicoRepository.findAll(pageable);
    }

    /**
     * Busca um serviço socioassistencial pelo ID.
     * @param id ID do serviço socioassistencial.
     * @return O serviço socioassistencial encontrado.
     */
    @Transactional(readOnly = true)
    public Optional<ServicoSocioassistencial> buscarPorId(Long id) {
        return servicoRepository.findById(id);
    }

    /**
     * Busca um serviço socioassistencial pelo nome.
     * @param nome Nome do serviço socioassistencial.
     * @return O serviço socioassistencial encontrado.
     */
    @Transactional(readOnly = true)
    public Optional<ServicoSocioassistencial> buscarPorNome(String nome) {
        return servicoRepository.findByNome(nome);
    }

    /**
     * Busca serviços socioassistenciais pelo nome contendo o texto informado.
     * @param nome Texto a ser buscado no nome do serviço socioassistencial.
     * @param pageable Informações de paginação.
     * @return Página de serviços socioassistenciais encontrados.
     */
    @Transactional(readOnly = true)
    public Page<ServicoSocioassistencial> buscarPorNomeContendo(String nome, Pageable pageable) {
        return servicoRepository.findByNomeContainingIgnoreCase(nome, pageable);
    }

    /**
     * Busca serviços socioassistenciais ativos.
     * @return Lista de serviços socioassistenciais ativos.
     */
    @Transactional(readOnly = true)
    public List<ServicoSocioassistencial> buscarAtivos() {
        return servicoRepository.findByAtivoTrue();
    }

    /**
     * Busca serviços socioassistenciais ativos com paginação.
     * @param pageable Informações de paginação.
     * @return Página de serviços socioassistenciais ativos.
     */
    @Transactional(readOnly = true)
    public Page<ServicoSocioassistencial> buscarAtivos(Pageable pageable) {
        return servicoRepository.findByAtivoTrue(pageable);
    }

    /**
     * Busca serviços socioassistenciais com vagas disponíveis.
     * @return Lista de serviços socioassistenciais com vagas disponíveis.
     */
    @Transactional(readOnly = true)
    public List<ServicoSocioassistencial> buscarComVagasDisponiveis() {
        return servicoRepository.findWithAvailableVacancies();
    }

    /**
     * Salva um serviço socioassistencial.
     * @param servico Serviço socioassistencial a ser salvo.
     * @param usuarioCadastro O usuário que está realizando o cadastro.
     * @return O serviço socioassistencial salvo.
     */
    @Transactional
    public ServicoSocioassistencial salvar(ServicoSocioassistencial servico, String usuarioCadastro) {
        boolean isNovo = servico.getId() == null;
        
        // Verifica se já existe um serviço com o mesmo nome
        if (isNovo) {
            Optional<ServicoSocioassistencial> existente = servicoRepository.findByNome(servico.getNome());
            if (existente.isPresent()) {
                throw new IllegalArgumentException("Já existe um serviço socioassistencial com o nome informado.");
            }
            
            servico.setDataCadastro(LocalDateTime.now());
            servico.setUsuarioCadastro(usuarioCadastro);
        }
        
        servico.setDataAtualizacao(LocalDateTime.now());
        servico.setUsuarioAtualizacao(usuarioCadastro);
        
        return servicoRepository.save(servico);
    }

    /**
     * Adiciona um grupo ao serviço socioassistencial.
     * @param servicoId ID do serviço socioassistencial.
     * @param grupo Grupo a ser adicionado.
     * @param usuarioCadastro O usuário que está realizando o cadastro.
     * @return O serviço socioassistencial atualizado.
     */
    @Transactional
    public ServicoSocioassistencial adicionarGrupo(Long servicoId, GrupoServicoSocioassistencial grupo, String usuarioCadastro) {
        ServicoSocioassistencial servico = servicoRepository.findById(servicoId)
                .orElseThrow(() -> new IllegalArgumentException("Serviço socioassistencial não encontrado."));
        
        // Verifica se já existe um grupo com o mesmo nome no serviço
        boolean grupoExistente = servico.getGrupos().stream()
                .anyMatch(g -> g.getNome().equalsIgnoreCase(grupo.getNome()));
        
        if (grupoExistente) {
            throw new IllegalArgumentException("Já existe um grupo com o nome informado neste serviço.");
        }
        
        grupo.setServico(servico);
        grupo.setDataCadastro(LocalDateTime.now());
        grupo.setUsuarioCadastro(usuarioCadastro);
        
        servico.getGrupos().add(grupo);
        
        return servicoRepository.save(servico);
    }

    /**
     * Ativa um serviço socioassistencial.
     * @param id ID do serviço socioassistencial.
     * @param usuarioAtualizacao O usuário que está realizando a atualização.
     * @return O serviço socioassistencial ativado.
     */
    @Transactional
    public ServicoSocioassistencial ativar(Long id, String usuarioAtualizacao) {
        ServicoSocioassistencial servico = servicoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Serviço socioassistencial não encontrado."));
        
        servico.setAtivo(true);
        servico.setDataAtualizacao(LocalDateTime.now());
        servico.setUsuarioAtualizacao(usuarioAtualizacao);
        
        return servicoRepository.save(servico);
    }

    /**
     * Inativa um serviço socioassistencial.
     * @param id ID do serviço socioassistencial.
     * @param usuarioAtualizacao O usuário que está realizando a atualização.
     * @return O serviço socioassistencial inativado.
     */
    @Transactional
    public ServicoSocioassistencial inativar(Long id, String usuarioAtualizacao) {
        ServicoSocioassistencial servico = servicoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Serviço socioassistencial não encontrado."));
        
        servico.setAtivo(false);
        servico.setDataAtualizacao(LocalDateTime.now());
        servico.setUsuarioAtualizacao(usuarioAtualizacao);
        
        return servicoRepository.save(servico);
    }

    /**
     * Exclui um serviço socioassistencial.
     * @param id ID do serviço socioassistencial.
     */
    @Transactional
    public void excluir(Long id) {
        ServicoSocioassistencial servico = servicoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Serviço socioassistencial não encontrado."));
        
        // Aqui poderia ter uma verificação se o serviço está sendo usado
        // em algum lugar antes de excluir
        
        servicoRepository.delete(servico);
    }
}
