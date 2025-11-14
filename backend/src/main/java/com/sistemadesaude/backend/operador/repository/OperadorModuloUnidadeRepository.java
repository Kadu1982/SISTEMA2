package com.sistemadesaude.backend.operador.repository;

import com.sistemadesaude.backend.operador.entity.OperadorModuloUnidade;
import com.sistemadesaude.backend.operador.entity.key.OperadorModuloUnidadeKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositório dos vínculos MÓDULO x OPERADOR x UNIDADE.
 */
@Repository
public interface OperadorModuloUnidadeRepository extends JpaRepository<OperadorModuloUnidade, OperadorModuloUnidadeKey> {

    /**
     * Lista os IDs das unidades vinculadas a um módulo específico do operador.
     */
    @Query("""
           select m.id.unidadeId
             from OperadorModuloUnidade m
            where m.id.operadorId = :operadorId
              and m.id.modulo = :modulo
           """)
    List<Long> findUnidadesByOperadorAndModulo(@Param("operadorId") Long operadorId, @Param("modulo") String modulo);

    /**
     * Lista todas as unidades vinculadas a todos os módulos do operador.
     */
    @Query("""
           select m.id.modulo, m.id.unidadeId
             from OperadorModuloUnidade m
            where m.id.operadorId = :operadorId
           """)
    List<Object[]> findModulosUnidadesByOperador(@Param("operadorId") Long operadorId);

    /**
     * Remove todos os vínculos de unidades de um módulo específico do operador.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from OperadorModuloUnidade m where m.id.operadorId = :operadorId and m.id.modulo = :modulo")
    void deleteByOperadorIdAndModulo(@Param("operadorId") Long operadorId, @Param("modulo") String modulo);

    /**
     * Remove todos os vínculos de módulos de um operador.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from OperadorModuloUnidade m where m.id.operadorId = :operadorId")
    void deleteByOperadorId(@Param("operadorId") Long operadorId);
}

