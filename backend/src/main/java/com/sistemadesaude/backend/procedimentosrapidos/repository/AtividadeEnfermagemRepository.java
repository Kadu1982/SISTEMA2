package com.sistemadesaude.backend.procedimentosrapidos.repository;

import com.sistemadesaude.backend.procedimentosrapidos.entity.AtividadeEnfermagem;
import com.sistemadesaude.backend.procedimentosrapidos.enums.SituacaoAtividade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AtividadeEnfermagemRepository extends JpaRepository<AtividadeEnfermagem, Long> {

    /**
     * Busca atividades por procedimento
     */
    List<AtividadeEnfermagem> findByProcedimentoRapidoIdOrderByDataCriacaoAsc(Long procedimentoRapidoId);

    /**
     * Busca atividades por situação
     */
    List<AtividadeEnfermagem> findBySituacao(SituacaoAtividade situacao);

    /**
     * Busca atividades urgentes pendentes
     */
    @Query("""
        SELECT a FROM AtividadeEnfermagem a
        WHERE a.urgente = true
        AND a.situacao = 'PENDENTE'
        ORDER BY a.dataCriacao ASC
    """)
    List<AtividadeEnfermagem> findUrgentesPendentes();

    /**
     * Conta atividades pendentes de um procedimento
     */
    @Query("""
        SELECT COUNT(a) FROM AtividadeEnfermagem a
        WHERE a.procedimentoRapido.id = :procedimentoId
        AND a.situacao = 'PENDENTE'
    """)
    Long countPendentesByProcedimento(@Param("procedimentoId") Long procedimentoId);

    /**
     * Verifica se existem atividades pendentes em um procedimento
     */
    boolean existsByProcedimentoRapidoIdAndSituacao(Long procedimentoId, SituacaoAtividade situacao);
}
