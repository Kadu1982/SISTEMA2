
package com.sistemadesaude.backend.unidadesaude.service;

import com.sistemadesaude.backend.unidadesaude.dto.UnidadeSaudeDTO;
import com.sistemadesaude.backend.unidadesaude.entity.UnidadeSaude;
import com.sistemadesaude.backend.unidadesaude.mapper.UnidadeSaudeMapper;
import com.sistemadesaude.backend.unidadesaude.repository.UnidadeSaudeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * Serviço para gerenciamento de Unidades de Saúde.
 * Implementa operações CRUD e cache em memória para melhorar performance.
 */
@Service
public class UnidadeSaudeService {

    // Logger para registrar eventos e erros
    private static final Logger logger = LoggerFactory.getLogger(UnidadeSaudeService.class);

    // Tempo de expiração do cache em milissegundos (10 minutos)
    private static final long CACHE_EXPIRATION_MS = TimeUnit.MINUTES.toMillis(10);

    // Repositório para acesso aos dados de Unidades de Saúde
    @Autowired
    private UnidadeSaudeRepository unidadeRepo;

    // Mapper para conversão entre entidade e DTO
    @Autowired
    private UnidadeSaudeMapper unidadeMapper;

    // Cache para lista de todas as unidades
    private List<UnidadeSaudeDTO> cacheListaUnidades;

    // Timestamp da última atualização do cache de lista
    private long cacheListaTimestamp;

    // Cache para unidades individuais por ID
    private final Map<Long, UnidadeSaudeDTO> cacheUnidadePorId = new ConcurrentHashMap<>();

    // Timestamps de cada entrada no cache de unidades por ID
    private final Map<Long, Long> cacheUnidadeTimestamps = new ConcurrentHashMap<>();

    /**
     * Lista todas as unidades de saúde com cache em memória.
     * O cache expira após 10 minutos para garantir dados atualizados.
     *
     * @return Lista de DTOs de Unidades de Saúde
     */
    public List<UnidadeSaudeDTO> listarTodas() {
        // Verifica se o cache existe e ainda é válido
        if (cacheListaUnidades != null &&
                System.currentTimeMillis() - cacheListaTimestamp < CACHE_EXPIRATION_MS) {

            // Usa o cache se estiver válido
            logger.debug("Retornando lista de unidades do cache");
            return cacheListaUnidades;
        }

        // Se o cache não existir ou estiver expirado, busca do banco de dados
        logger.debug("Buscando lista de unidades do banco de dados");

        try {
            // Busca todas as unidades do repositório
            logger.debug("Buscando unidades do repositório...");
            List<UnidadeSaude> entidades = unidadeRepo.findAll();
            logger.debug("Encontradas {} unidades no banco de dados", entidades.size());
            
            List<UnidadeSaudeDTO> unidades = entidades.stream()
                    .map(entity -> {
                        try {
                            logger.trace("Convertendo unidade {} para DTO", entity.getId());
                            return unidadeMapper.toDTO(entity);
                        } catch (Exception e) {
                            logger.error("Erro ao converter unidade {} para DTO: {}", 
                                    entity != null && entity.getId() != null ? entity.getId() : "null", 
                                    e.getMessage(), e);
                            // Retorna um DTO básico em caso de erro
                            UnidadeSaudeDTO dto = new UnidadeSaudeDTO();
                            if (entity != null) {
                                dto.setId(entity.getId());
                                dto.setNome(entity.getNome());
                                dto.setCodigoCnes(entity.getCodigoCnes());
                                dto.setTipo(entity.getTipo());
                                dto.setAtiva(entity.getAtiva());
                            }
                            dto.setPerfisPermitidos(new java.util.ArrayList<>());
                            return dto;
                        }
                    })
                    .collect(Collectors.toList());

            logger.debug("Conversão concluída. {} DTOs criados", unidades.size());
            
            // Atualiza o cache
            cacheListaUnidades = unidades;
            cacheListaTimestamp = System.currentTimeMillis();

            return unidades;
        } catch (Exception e) {
            logger.error("Erro ao listar unidades: {}", e.getMessage(), e);
            logger.error("Stack trace completo:", e);
            throw new RuntimeException("Erro ao listar unidades: " + e.getMessage(), e);
        }
    }

    /**
     * Lista unidades resumidas (para seleções e listagens simples)
     *
     * @return Lista de DTOs resumidos de Unidades de Saúde
     */
    public List<UnidadeSaudeDTO> listarResumidas() {
        logger.debug("Buscando lista resumida de unidades");

        List<UnidadeSaude> entidades = unidadeRepo.findAll();
        return entidades.stream()
                .map(unidadeMapper::toDTOResumido)
                .collect(Collectors.toList());
    }

    /**
     * Busca uma unidade de saúde por ID com cache em memória.
     * O cache de cada unidade expira após 10 minutos.
     *
     * @param id ID da unidade de saúde
     * @return DTO da Unidade de Saúde
     * @throws RuntimeException se a unidade não for encontrada
     */
    public UnidadeSaudeDTO buscarPorId(Long id) {
        // Verifica se o ID está no cache e se ainda é válido
        if (cacheUnidadePorId.containsKey(id) &&
                System.currentTimeMillis() - cacheUnidadeTimestamps.get(id) < CACHE_EXPIRATION_MS) {

            // Usa o cache se estiver válido
            logger.debug("Retornando unidade {} do cache", id);
            return cacheUnidadePorId.get(id);
        }

        // Se não estiver no cache ou estiver expirado, busca do banco de dados
        logger.debug("Buscando unidade {} do banco de dados", id);

        // Busca a unidade do repositório
        UnidadeSaude unidade = unidadeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Unidade não encontrada"));

        // Converte para DTO
        UnidadeSaudeDTO dto = unidadeMapper.toDTO(unidade);

        // Atualiza o cache
        cacheUnidadePorId.put(id, dto);
        cacheUnidadeTimestamps.put(id, System.currentTimeMillis());

        return dto;
    }

    /**
     * Cria uma nova unidade de saúde.
     * Invalida o cache de lista após a criação.
     *
     * @param dto DTO com dados da nova unidade
     * @return DTO da unidade criada
     */
    public UnidadeSaudeDTO criar(UnidadeSaudeDTO dto) {
        // Converte DTO para entidade
        UnidadeSaude nova = unidadeMapper.toEntity(dto);

        // Garante que perfisPermitidos não seja null
        if (nova.getPerfisPermitidos() == null) {
            nova.setPerfisPermitidos(new java.util.HashSet<>());
        }

        // Salva no banco de dados
        UnidadeSaude savedEntity = unidadeRepo.save(nova);
        UnidadeSaudeDTO resultado = unidadeMapper.toDTO(savedEntity);

        // Invalida o cache de lista para forçar recarregamento
        invalidarCacheLista();

        logger.info("Unidade de saúde criada com ID: {}", resultado.getId());
        return resultado;
    }

    /**
     * Atualiza uma unidade de saúde existente
     *
     * @param id ID da unidade a ser atualizada
     * @param dto DTO com os novos dados
     * @return DTO da unidade atualizada
     */
    public UnidadeSaudeDTO atualizar(Long id, UnidadeSaudeDTO dto) {
        // Busca a unidade existente
        UnidadeSaude unidadeExistente = unidadeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Unidade não encontrada"));

        // Atualiza os dados
        unidadeMapper.updateEntityFromDTO(unidadeExistente, dto);

        // Garante que perfisPermitidos não seja null
        if (unidadeExistente.getPerfisPermitidos() == null) {
            unidadeExistente.setPerfisPermitidos(new java.util.HashSet<>());
        }

        // Salva as alterações
        UnidadeSaude savedEntity = unidadeRepo.save(unidadeExistente);
        UnidadeSaudeDTO resultado = unidadeMapper.toDTO(savedEntity);

        // Invalida os caches
        invalidarCacheUnidade(id);
        invalidarCacheLista();

        logger.info("Unidade de saúde {} atualizada", id);
        return resultado;
    }

    /**
     * Deleta uma unidade de saúde por ID.
     * Invalida os caches após a deleção.
     *
     * @param id ID da unidade a ser deletada
     */
    public void deletar(Long id) {
        // Deleta do banco de dados
        unidadeRepo.deleteById(id);

        // Remove do cache de unidades por ID
        invalidarCacheUnidade(id);

        // Invalida o cache de lista
        invalidarCacheLista();

        logger.info("Unidade de saúde com ID {} deletada", id);
    }

    /**
     * Invalida o cache de lista de unidades.
     * Chamado internamente quando há modificações nas unidades.
     */
    private void invalidarCacheLista() {
        cacheListaUnidades = null;
        logger.debug("Cache de lista de unidades invalidado");
    }

    /**
     * Invalida o cache de uma unidade específica
     */
    private void invalidarCacheUnidade(Long id) {
        cacheUnidadePorId.remove(id);
        cacheUnidadeTimestamps.remove(id);
        logger.debug("Cache da unidade {} invalidado", id);
    }
}
