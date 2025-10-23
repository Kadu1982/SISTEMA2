package com.sistemadesaude.backend.operador.repository;

import com.sistemadesaude.backend.operador.entity.OperadorRestricaoAcesso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositório de restrições de acesso do Operador.
 */
@Repository
public interface OperadorRestricaoAcessoRepository extends JpaRepository<OperadorRestricaoAcesso, Long> {

    /**
     * Lista todas as restrições de um operador ordenadas por ID.
     */
    List<OperadorRestricaoAcesso> findByOperadorIdOrderByIdAsc(Long operadorId);

    /**
     * Lista os IDs de unidades que estão explicitamente permitidas ao operador.
     * Usa a entidade de vínculo OperadorUnidade.
     */
    @Query("""
           SELECT ou.id.unidadeId
             FROM OperadorUnidade ou
            WHERE ou.id.operadorId = :operadorId
           """)
    List<Long> listarUnidadesPermitidas(@Param("operadorId") Long operadorId);

    /**
     * Retorna todas as restrições registradas para um operador.
     */
    List<OperadorRestricaoAcesso> findByOperadorId(Long operadorId);
}