package com.sistemadesaude.backend.configuracoes.repository;

import com.sistemadesaude.backend.configuracoes.entity.Configuracao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositório para acesso aos dados de configuração
 */
@Repository
public interface ConfiguracaoRepository extends JpaRepository<Configuracao, String> {

    /**
     * Busca configurações por grupo
     * @param grupo Grupo de configurações
     * @return Lista de configurações do grupo
     */
    List<Configuracao> findByGrupoOrderByChaveAsc(String grupo);

    /**
     * Busca configurações por grupo e chave
     * @param grupo Grupo de configurações
     * @param chave Chave da configuração
     * @return Configuração encontrada
     */
    Optional<Configuracao> findByGrupoAndChave(String grupo, String chave);

    /**
     * Busca configurações por chave contendo texto
     * @param texto Texto a ser buscado na chave
     * @return Lista de configurações com chave contendo o texto
     */
    List<Configuracao> findByChaveContainingIgnoreCaseOrderByChaveAsc(String texto);

    /**
     * Busca configurações por grupo e chave contendo texto
     * @param grupo Grupo de configurações
     * @param texto Texto a ser buscado na chave
     * @return Lista de configurações do grupo com chave contendo o texto
     */
    List<Configuracao> findByGrupoAndChaveContainingIgnoreCaseOrderByChaveAsc(String grupo, String texto);

    /**
     * Verifica se existe configuração com a chave
     * @param chave Chave da configuração
     * @return true se existir, false caso contrário
     */
    boolean existsByChave(String chave);

    /**
     * Busca configurações editáveis
     * @return Lista de configurações editáveis
     */
    List<Configuracao> findByEditavelTrueOrderByGrupoAscChaveAsc();

    /**
     * Busca configurações por grupo e editável
     * @param grupo Grupo de configurações
     * @param editavel Indica se é editável
     * @return Lista de configurações do grupo e editável
     */
    List<Configuracao> findByGrupoAndEditavelOrderByChaveAsc(String grupo, Boolean editavel);

    /**
     * Conta configurações por grupo
     * @param grupo Grupo de configurações
     * @return Quantidade de configurações no grupo
     */
    long countByGrupo(String grupo);

    /**
     * Lista todos os grupos distintos
     * @return Lista de grupos
     */
    @Query("SELECT DISTINCT c.grupo FROM Configuracao c ORDER BY c.grupo")
    List<String> findAllGroups();
}
