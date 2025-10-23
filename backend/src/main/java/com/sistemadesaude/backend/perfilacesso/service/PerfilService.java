package com.sistemadesaude.backend.perfilacesso.service;

import com.sistemadesaude.backend.perfilacesso.dto.PerfilDTO;
import jakarta.persistence.EntityNotFoundException;

import java.util.List;
import java.util.Optional;

/**
 * Interface de serviço para gerenciamento de perfis de acesso
 */
public interface PerfilService {

    /**
     * Lista todos os perfis
     * @return Lista de perfis
     */
    List<PerfilDTO> listarTodos();

    /**
     * Busca um perfil pelo ID
     * @param id ID do perfil
     * @return Perfil encontrado ou vazio
     */
    Optional<PerfilDTO> buscarPorId(Long id);

    /**
     * Busca um perfil pelo nome (nome customizado)
     * @param nome Nome do perfil
     * @return Perfil encontrado ou vazio
     */
    Optional<PerfilDTO> buscarPorNome(String nome);

    /**
     * Cria um novo perfil
     * @param perfilDTO Dados do perfil
     * @return Perfil criado
     * @throws IllegalArgumentException Se houver conflito de dados
     */
    PerfilDTO criar(PerfilDTO perfilDTO) throws IllegalArgumentException;

    /**
     * Atualiza um perfil existente
     * @param id ID do perfil
     * @param perfilDTO Novos dados do perfil
     * @return Perfil atualizado
     * @throws EntityNotFoundException Se o perfil não for encontrado
     * @throws IllegalArgumentException Se houver conflito de dados
     */
    PerfilDTO atualizar(Long id, PerfilDTO perfilDTO) throws EntityNotFoundException, IllegalArgumentException;

    /**
     * Exclui um perfil
     * @param id ID do perfil
     * @throws EntityNotFoundException Se o perfil não for encontrado
     * @throws IllegalStateException Se o perfil for um perfil de sistema
     */
    void excluir(Long id) throws EntityNotFoundException, IllegalStateException;

    /**
     * Atribui permissões a um perfil
     * @param id ID do perfil
     * @param permissoes Lista de permissões
     * @return Perfil atualizado
     * @throws EntityNotFoundException Se o perfil não for encontrado
     */
    PerfilDTO atribuirPermissoes(Long id, List<String> permissoes) throws EntityNotFoundException;

    /**
     * Lista todas as permissões disponíveis no sistema
     * @return Lista de permissões
     */
    List<String> listarPermissoes();

    /**
     * Busca perfis por termo (nome/descrição) e por tipo quando aplicável.
     */
    List<PerfilDTO> buscarPorTermo(String termo);
}
