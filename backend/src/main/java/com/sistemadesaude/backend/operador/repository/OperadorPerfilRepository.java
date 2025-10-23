package com.sistemadesaude.backend.operador.repository;

import com.sistemadesaude.backend.operador.entity.OperadorPerfil;
import com.sistemadesaude.backend.operador.entity.key.OperadorPerfilKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositório dos vínculos PERFIL x OPERADOR.
 *
 * Modelagem considerada: ID composto (EmbeddedId) em OperadorPerfil.id (OperadorPerfilKey).
 *
 * Métodos "oficiais" expostos:
 *  - List<OperadorPerfil> findByIdOperadorId(Long operadorId)
 *  - List<String>         findPerfis(Long operadorId)              // strings (códigos)
 *  - void                 deleteByOperadorId(Long operadorId)      // apaga todos vínculos
 *
 * Aliases de compatibilidade (@Deprecated) foram incluídos abaixo para evitar
 * que código legado que use nomes diferentes quebre na compilação (delegam para os oficiais).
 */
@Repository
public interface OperadorPerfilRepository extends JpaRepository<OperadorPerfil, OperadorPerfilKey> {

    /* =======================
       MÉTODOS OFICIAIS
       ======================= */

    /**
     * Lista entidades de vínculo por operador (útil quando você precisa do objeto completo).
     * Derivação para EmbeddedId: navega via "id.operadorId".
     */
    List<OperadorPerfil> findByIdOperadorId(Long operadorId);

    /**
     * Lista APENAS os códigos de perfil (strings) do operador.
     * Leve para popular a aba de Perfis.
     */
    @Query("""
           select p.id.perfil
             from OperadorPerfil p
            where p.id.operadorId = :operadorId
            order by p.id.perfil asc
           """)
    List<String> findPerfis(@Param("operadorId") Long operadorId);

    /**
     * Remove todos os vínculos de perfis de um operador.
     * Usamos @Modifying + JPQL porque com EmbeddedId a derivação "deleteByIdOperadorId"
     * nem sempre é reconhecida corretamente.
     *
     * É importante que o chamador esteja dentro de uma @Transactional (os controllers PUT já estão).
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from OperadorPerfil p where p.id.operadorId = :operadorId")
    void deleteByOperadorId(@Param("operadorId") Long operadorId);

    /* =======================
       ALIASES DE COMPATIBILIDADE (LEGADO)
       ======================= */

    /**
     * Alias legado para projetos que chamavam findByOperadorId(...).
     * ⚠️ Preferir findByIdOperadorId(...).
     */
    @Deprecated
    default List<OperadorPerfil> findByOperadorId(Long operadorId) {
        return findByIdOperadorId(operadorId);
    }

    /**
     * Alias legado para projetos que chamavam findPerfisByOperadorId(...).
     * ⚠️ Preferir findPerfis(...).
     */
    @Deprecated
    default List<String> findPerfisByOperadorId(Long operadorId) {
        return findPerfis(operadorId);
    }

    /**
     * Alias legado para projetos que chamavam deleteByOperadorId(Long) por derivação
     * mas sem @Modifying/@Query. Mantido aqui apenas para explicitar que o nome existe
     * na interface; a operação é a mesma do método oficial acima.
     */
    @Deprecated
    default void deleteByOperadorIdCompat(Long operadorId) {
        deleteByOperadorId(operadorId);
    }
}
