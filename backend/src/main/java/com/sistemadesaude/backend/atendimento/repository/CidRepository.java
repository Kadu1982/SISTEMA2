package com.sistemadesaude.backend.atendimento.repository;

import com.sistemadesaude.backend.atendimento.entity.Cid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository otimizado para consultas na tabela CID existente
 * Colunas: id, codigo, descricao
 */
@Repository
public interface CidRepository extends JpaRepository<Cid, Long> {

    // ✅ BUSCA HÍBRIDA OTIMIZADA - Código ou Descrição
    @Query(value = """
        SELECT id, codigo, descricao 
        FROM cid 
        WHERE UPPER(codigo) LIKE UPPER(CONCAT('%', :termo, '%'))
           OR UPPER(descricao) LIKE UPPER(CONCAT('%', :termo, '%'))
        ORDER BY 
            CASE 
                WHEN UPPER(codigo) = UPPER(:termo) THEN 1
                WHEN UPPER(codigo) LIKE UPPER(CONCAT(:termo, '%')) THEN 2
                WHEN UPPER(descricao) LIKE UPPER(CONCAT(:termo, '%')) THEN 3
                ELSE 4
            END,
            LENGTH(codigo),
            codigo
        LIMIT 10
        """, nativeQuery = true)
    List<Cid> findTop10ByCodigoContainingIgnoreCaseOrDescricaoContainingIgnoreCase(
            @Param("termo") String codigo,
            @Param("termo") String descricao);

    // ✅ BUSCA EXATA POR CÓDIGO
    @Query("SELECT c FROM Cid c WHERE UPPER(c.codigo) = UPPER(:codigo)")
    Optional<Cid> findByCodigoExato(@Param("codigo") String codigo);

    // ✅ BUSCA POR CÓDIGO (LIKE) - Otimizada
    @Query(value = """
        SELECT id, codigo, descricao 
        FROM cid 
        WHERE UPPER(codigo) LIKE UPPER(CONCAT(:codigo, '%'))
        ORDER BY 
            CASE WHEN UPPER(codigo) = UPPER(:codigo) THEN 1 ELSE 2 END,
            LENGTH(codigo),
            codigo
        LIMIT 15
        """, nativeQuery = true)
    List<Cid> findByCodigoStartingWith(@Param("codigo") String codigo);

    // ✅ BUSCA POR DESCRIÇÃO - Full Text Search
    @Query(value = """
        SELECT id, codigo, descricao,
               ts_rank(to_tsvector('portuguese', descricao), plainto_tsquery('portuguese', :descricao)) as rank
        FROM cid 
        WHERE to_tsvector('portuguese', descricao) @@ plainto_tsquery('portuguese', :descricao)
           OR UPPER(descricao) LIKE UPPER(CONCAT('%', :descricao, '%'))
        ORDER BY 
            rank DESC NULLS LAST,
            CASE WHEN UPPER(descricao) LIKE UPPER(CONCAT(:descricao, '%')) THEN 1 ELSE 2 END,
            LENGTH(descricao),
            descricao
        LIMIT 15
        """, nativeQuery = true)
    List<Cid> findByDescricaoFullText(@Param("descricao") String descricao);

    // ✅ BUSCA INTELIGENTE POR TERMO
    @Query(value = """
        SELECT id, codigo, descricao,
               CASE 
                   WHEN UPPER(codigo) = UPPER(:termo) THEN 1
                   WHEN UPPER(codigo) LIKE UPPER(CONCAT(:termo, '%')) THEN 2
                   WHEN UPPER(codigo) LIKE UPPER(CONCAT('%', :termo, '%')) THEN 3
                   WHEN UPPER(descricao) LIKE UPPER(CONCAT(:termo, '%')) THEN 4
                   WHEN to_tsvector('portuguese', descricao) @@ plainto_tsquery('portuguese', :termo) THEN 5
                   ELSE 6
               END as prioridade,
               ts_rank(to_tsvector('portuguese', descricao), plainto_tsquery('portuguese', :termo)) as rank
        FROM cid 
        WHERE UPPER(codigo) LIKE UPPER(CONCAT('%', :termo, '%'))
           OR UPPER(descricao) LIKE UPPER(CONCAT('%', :termo, '%'))
           OR to_tsvector('portuguese', descricao) @@ plainto_tsquery('portuguese', :termo)
        ORDER BY prioridade, rank DESC NULLS LAST, codigo
        LIMIT 15
        """, nativeQuery = true)
    List<Cid> findByTermoInteligente(@Param("termo") String termo);

    // ✅ AUTOCOMPLETE RÁPIDO
    @Query(value = """
        SELECT codigo, descricao
        FROM cid 
        WHERE UPPER(codigo) LIKE UPPER(CONCAT(:termo, '%'))
           OR UPPER(descricao) LIKE UPPER(CONCAT(:termo, '%'))
        ORDER BY 
            CASE WHEN UPPER(codigo) LIKE UPPER(CONCAT(:termo, '%')) THEN 1 ELSE 2 END,
            LENGTH(codigo),
            codigo
        LIMIT 8
        """, nativeQuery = true)
    List<Object[]> findForAutocomplete(@Param("termo") String termo);

    // ✅ BUSCA POR MÚLTIPLOS CRITÉRIOS (similar ao PacienteRepository)
    @Query("""
        SELECT c FROM Cid c 
        WHERE UPPER(c.codigo) LIKE UPPER(CONCAT('%', :termo, '%'))
           OR UPPER(c.descricao) LIKE UPPER(CONCAT('%', :termo, '%'))
        ORDER BY 
            CASE 
                WHEN UPPER(c.codigo) = UPPER(:termo) THEN 1
                WHEN UPPER(c.codigo) LIKE UPPER(CONCAT(:termo, '%')) THEN 2
                ELSE 3
            END,
            c.codigo ASC
        """)
    List<Cid> buscarPorMultiplosCriterios(@Param("termo") String termo);

    // ✅ LISTAR TODOS COM PAGINAÇÃO
    @Query("SELECT c FROM Cid c ORDER BY c.codigo")
    Page<Cid> findAllOrderByCodigo(Pageable pageable);

    // ✅ BUSCAR POR ID
    @Query("SELECT c FROM Cid c WHERE c.id = :id")
    Optional<Cid> findByIdCustom(@Param("id") Long id);

    // ✅ BUSCAR CÓDIGOS RELACIONADOS (mesmo grupo)
    @Query(value = """
        SELECT id, codigo, descricao 
        FROM cid 
        WHERE codigo LIKE CONCAT(:codigoBase, '%')
          AND codigo != :codigoExato
        ORDER BY codigo
        LIMIT 10
        """, nativeQuery = true)
    List<Cid> findCodigosRelacionados(
            @Param("codigoBase") String codigoBase,
            @Param("codigoExato") String codigoExato);

    // ✅ ESTATÍSTICAS
    @Query("SELECT COUNT(c) FROM Cid c")
    long countAll();

    // ✅ VERIFICAR EXISTÊNCIA
    boolean existsByCodigo(String codigo);

    // ✅ BUSCAR TOP CIDs MAIS USADOS (se tiver campo de uso)
    @Query(value = """
        SELECT id, codigo, descricao 
        FROM cid 
        WHERE codigo IN (
            SELECT DISTINCT codigo 
            FROM cid 
            ORDER BY codigo 
            LIMIT 50
        )
        ORDER BY codigo
        """, nativeQuery = true)
    List<Cid> findTopCids();

    // ✅ BUSCAR POR CATEGORIA (se o código indicar categoria)
    @Query(value = """
        SELECT id, codigo, descricao 
        FROM cid 
        WHERE codigo LIKE CONCAT(:categoria, '%')
        ORDER BY codigo
        LIMIT 20
        """, nativeQuery = true)
    List<Cid> findByCategoria(@Param("categoria") String categoria);

    // ✅ BUSCA CASE-INSENSITIVE SIMPLES
    List<Cid> findByCodigoContainingIgnoreCaseOrDescricaoContainingIgnoreCase(String codigo, String descricao);
}
