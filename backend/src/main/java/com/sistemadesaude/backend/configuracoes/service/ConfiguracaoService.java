package com.sistemadesaude.backend.configuracoes.service;

import com.sistemadesaude.backend.configuracoes.dto.ConfiguracaoDTO;
import jakarta.persistence.EntityNotFoundException;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Interface de serviço para gerenciamento de configurações do sistema
 */
public interface ConfiguracaoService {

    /**
     * Lista todas as configurações
     * @return Lista de configurações
     */
    List<ConfiguracaoDTO> listarTodas();

    /**
     * Lista configurações por grupo
     * @param grupo Grupo de configurações
     * @return Lista de configurações do grupo
     */
    List<ConfiguracaoDTO> listarPorGrupo(String grupo);

    /**
     * Busca configurações por grupo como mapa
     * @param grupo Grupo de configurações
     * @return Mapa de configurações (chave -> valor)
     */
    Map<String, String> buscarMapaPorGrupo(String grupo);

    /**
     * Busca uma configuração pela chave
     * @param chave Chave da configuração
     * @return Configuração encontrada ou vazio
     */
    Optional<ConfiguracaoDTO> buscarPorChave(String chave);

    /**
     * Busca o valor de uma configuração pela chave
     * @param chave Chave da configuração
     * @param valorPadrao Valor padrão caso não encontre
     * @return Valor da configuração ou valor padrão
     */
    String buscarValor(String chave, String valorPadrao);

    /**
     * Busca configurações por chave contendo texto
     * @param texto Texto a ser buscado na chave
     * @return Lista de configurações com chave contendo o texto
     */
    List<ConfiguracaoDTO> buscarPorChaveContendo(String texto);

    /**
     * Busca configurações por grupo e chave contendo texto
     * @param grupo Grupo de configurações
     * @param texto Texto a ser buscado na chave
     * @return Lista de configurações do grupo com chave contendo o texto
     */
    List<ConfiguracaoDTO> buscarPorGrupoEChaveContendo(String grupo, String texto);

    /**
     * Salva uma configuração
     * @param configuracaoDTO Dados da configuração
     * @return Configuração salva
     */
    ConfiguracaoDTO salvar(ConfiguracaoDTO configuracaoDTO);

    /**
     * Salva múltiplas configurações
     * @param configuracoes Lista de configurações
     * @return Lista de configurações salvas
     */
    List<ConfiguracaoDTO> salvarTodas(List<ConfiguracaoDTO> configuracoes);

    /**
     * Atualiza uma configuração
     * @param chave Chave da configuração
     * @param configuracaoDTO Novos dados da configuração
     * @return Configuração atualizada
     * @throws EntityNotFoundException Se a configuração não for encontrada
     */
    ConfiguracaoDTO atualizar(String chave, ConfiguracaoDTO configuracaoDTO) throws EntityNotFoundException;

    /**
     * Exclui uma configuração
     * @param chave Chave da configuração
     * @throws EntityNotFoundException Se a configuração não for encontrada
     */
    void excluir(String chave) throws EntityNotFoundException;

    /**
     * Lista todos os grupos distintos
     * @return Lista de grupos
     */
    List<String> listarGrupos();

    /**
     * Busca configurações editáveis
     * @return Lista de configurações editáveis
     */
    List<ConfiguracaoDTO> listarEditaveis();

    /**
     * Busca configurações por grupo e editável
     * @param grupo Grupo de configurações
     * @param editavel Indica se é editável
     * @return Lista de configurações do grupo e editável
     */
    List<ConfiguracaoDTO> listarPorGrupoEEditavel(String grupo, Boolean editavel);
}
