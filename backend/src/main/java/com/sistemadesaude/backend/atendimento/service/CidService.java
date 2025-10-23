package com.sistemadesaude.backend.atendimento.service;

import com.sistemadesaude.backend.atendimento.entity.Cid;
import com.sistemadesaude.backend.atendimento.repository.CidRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Serviço otimizado para consultas CID na tabela existente
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CidService {

    private final CidRepository cidRepository;

    /**
     * ✅ BUSCA INTELIGENTE POR CÓDIGO
     */
    @Cacheable(value = "cid-codigo", key = "#codigo", unless = "#result.isEmpty()")
    public List<Cid> buscarPorCodigo(String codigo) {
        log.debug("🔍 Buscando CID por código: {}", codigo);

        if (codigo == null || codigo.trim().length() < 1) {
            return List.of();
        }

        String codigoLimpo = codigo.trim().toUpperCase();

        // Busca exata primeiro
        Optional<Cid> cidExato = cidRepository.findByCodigoExato(codigoLimpo);
        if (cidExato.isPresent()) {
            log.debug("✅ CID exato encontrado: {}", cidExato.get().getCodigo());
            return List.of(cidExato.get());
        }

        // Busca por prefixo
        List<Cid> resultados = cidRepository.findByCodigoStartingWith(codigoLimpo);
        log.debug("✅ Encontrados {} CIDs por código '{}'", resultados.size(), codigo);

        return resultados;
    }

    /**
     * ✅ BUSCA INTELIGENTE POR DESCRIÇÃO
     */
    @Cacheable(value = "cid-descricao", key = "#descricao", unless = "#result.isEmpty()")
    public List<Cid> buscarPorDescricao(String descricao) {
        log.debug("🔍 Buscando CID por descrição: {}", descricao);

        if (descricao == null || descricao.trim().length() < 2) {
            return List.of();
        }

        // Usar método original para compatibilidade ou o otimizado
        List<Cid> resultados = cidRepository.findTop10ByCodigoContainingIgnoreCaseOrDescricaoContainingIgnoreCase(
                descricao.trim(), descricao.trim());

        log.debug("✅ Encontrados {} CIDs por descrição '{}'", resultados.size(), descricao);
        return resultados;
    }

    /**
     * ✅ BUSCA HÍBRIDA OTIMIZADA
     */
    public List<Cid> buscarPorTermo(String termo) {
        log.debug("🔍 Buscando CID por termo: {}", termo);

        if (termo == null || termo.trim().length() < 1) {
            return List.of();
        }

        String termoLimpo = termo.trim();

        // Se parece com código CID, priorizar busca por código
        if (termoLimpo.matches("^[A-Z].*") || termoLimpo.matches("^[0-9].*")) {
            log.debug("🎯 Termo parece ser código, priorizando busca por código");
            List<Cid> porCodigo = buscarPorCodigo(termoLimpo);
            if (!porCodigo.isEmpty()) {
                return porCodigo;
            }
        }

        // Usar busca inteligente se disponível, senão usar a original
        try {
            List<Cid> resultados = cidRepository.findByTermoInteligente(termoLimpo);
            log.debug("✅ Encontrados {} CIDs por termo '{}' (busca inteligente)", resultados.size(), termo);
            return resultados;
        } catch (Exception e) {
            // Fallback para método original
            log.debug("⚠️ Usando fallback para busca simples");
            List<Cid> resultados = cidRepository.findTop10ByCodigoContainingIgnoreCaseOrDescricaoContainingIgnoreCase(
                    termoLimpo, termoLimpo);
            log.debug("✅ Encontrados {} CIDs por termo '{}' (busca simples)", resultados.size(), termo);
            return resultados;
        }
    }

    /**
     * ✅ BUSCA POR ID
     */
    @Cacheable(value = "cid-id", key = "#id")
    public Optional<Cid> buscarPorId(Long id) {
        log.debug("🔍 Buscando CID por ID: {}", id);

        if (id == null || id <= 0) {
            return Optional.empty();
        }

        return cidRepository.findById(id);
    }

    /**
     * ✅ LISTAR TODOS COM PAGINAÇÃO
     */
    public Page<Cid> listarTodos(Pageable pageable) {
        log.debug("📄 Listando CIDs - página: {}, tamanho: {}",
                pageable.getPageNumber(), pageable.getPageSize());

        try {
            return cidRepository.findAllOrderByCodigo(pageable);
        } catch (Exception e) {
            // Fallback para método padrão
            return cidRepository.findAll(pageable);
        }
    }

    /**
     * ✅ AUTOCOMPLETE RÁPIDO
     */
    @Cacheable(value = "cid-autocomplete", key = "#termo", unless = "#result.isEmpty()")
    public List<Map<String, String>> autocomplete(String termo) {
        log.debug("⚡ Autocomplete CID: {}", termo);

        if (termo == null || termo.trim().length() < 1) {
            return List.of();
        }

        try {
            List<Object[]> resultados = cidRepository.findForAutocomplete(termo.trim());

            return resultados.stream()
                    .map(obj -> Map.of(
                            "codigo", (String) obj[0],
                            "descricao", (String) obj[1],
                            "label", obj[0] + " - " + obj[1]
                    ))
                    .toList();
        } catch (Exception e) {
            // Fallback para busca simples
            List<Cid> cids = buscarPorTermo(termo);
            return cids.stream()
                    .limit(8)
                    .map(cid -> Map.of(
                            "codigo", cid.getCodigo(),
                            "descricao", cid.getDescricao(),
                            "label", cid.getCodigo() + " - " + cid.getDescricao()
                    ))
                    .toList();
        }
    }

    /**
     * ✅ BUSCAR CÓDIGOS RELACIONADOS
     */
    public List<Cid> buscarRelacionados(String codigo) {
        log.debug("🔗 Buscando CIDs relacionados a: {}", codigo);

        if (codigo == null || codigo.trim().isEmpty()) {
            return List.of();
        }

        // Obter código base (ex: A00.1 -> A00)
        String codigoBase = codigo.contains(".") ?
                codigo.substring(0, codigo.indexOf(".")) : codigo;

        try {
            return cidRepository.findCodigosRelacionados(codigoBase, codigo);
        } catch (Exception e) {
            log.debug("⚠️ Erro ao buscar relacionados, retornando lista vazia");
            return List.of();
        }
    }

    /**
     * ✅ BUSCA POR MÚLTIPLOS CRITÉRIOS (Compatível com PacienteRepository)
     */
    public List<Cid> buscarPorMultiplosCriterios(String termo) {
        log.debug("🔍 Busca por múltiplos critérios: {}", termo);

        if (termo == null || termo.trim().isEmpty()) {
            return List.of();
        }

        try {
            return cidRepository.buscarPorMultiplosCriterios(termo.trim());
        } catch (Exception e) {
            // Fallback
            return buscarPorTermo(termo);
        }
    }

    /**
     * ✅ ESTATÍSTICAS DO SISTEMA
     */
    @Cacheable(value = "cid-stats", key = "'stats'")
    public Map<String, Object> obterEstatisticas() {
        log.debug("📊 Obtendo estatísticas de CIDs");

        long totalCids = cidRepository.countAll();

        return Map.of(
                "totalCids", totalCids,
                "versao", "CID-10",
                "fonte", "Tabela Local",
                "ultimaAtualizacao", "Dados locais"
        );
    }

    /**
     * ✅ VERIFICAR EXISTÊNCIA
     */
    public boolean existePorCodigo(String codigo) {
        if (codigo == null || codigo.trim().isEmpty()) {
            return false;
        }
        return cidRepository.existsByCodigo(codigo.trim());
    }
}
