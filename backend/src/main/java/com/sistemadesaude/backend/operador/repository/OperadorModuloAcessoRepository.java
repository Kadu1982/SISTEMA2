package com.sistemadesaude.backend.operador.repository;

import com.sistemadesaude.backend.operador.entity.OperadorModuloAcesso;
import com.sistemadesaude.backend.operador.entity.key.OperadorModuloKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositório dos vínculos MÓDULO x OPERADOR.
 *
 * Modelagem: ID composto em OperadorModuloAcesso.id (OperadorModuloKey) com campos:
 * - Long operadorId
 * - String modulo   (se no seu projeto estiver como "codigo", veja o comentário do método findModulos)
 */
@Repository
public interface OperadorModuloAcessoRepository extends JpaRepository<OperadorModuloAcesso, OperadorModuloKey> {

    /** Lista entidades completas do operador (útil como fallback ou auditoria). */
    List<OperadorModuloAcesso> findByIdOperadorId(Long operadorId);

    /**
     * Lista APENAS os códigos de módulo (strings) do operador, em ordem ascendente.
     * ⚠️ Esta query assume que o campo no ID se chama "modulo".
     *    Se no seu projeto o nome for "codigo", troque m.id.modulo → m.id.codigo.
     */
    @Query("""
           select m.id.modulo
             from OperadorModuloAcesso m
            where m.id.operadorId = :operadorId
            order by m.id.modulo asc
           """)
    List<String> findModulos(@Param("operadorId") Long operadorId);

    /**
     * Remove todos os vínculos de módulos de um operador.
     * Usamos @Modifying + JPQL por ser ID composto (derivação nem sempre funciona).
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from OperadorModuloAcesso m where m.id.operadorId = :operadorId")
    void deleteByOperadorId(@Param("operadorId") Long operadorId);
}
