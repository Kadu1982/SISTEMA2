package com.sistemadesaude.backend.exames.repository;

import com.sistemadesaude.backend.exames.entity.Sadt;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repositório para entidade Sadt.
 *
 * ✅ Completo e estável para:
 *    - Geração de número (via prefixo "yyyyMMdd-") sem depender de substring/cast no SQL
 *    - Consultas por paciente/agendamento/tipo/status/urgência
 *    - Relatórios por período e operador
 *    - Reprocessamento de PDFs (itens sem cache)
 *
 * ⚠️ Nota de compatibilidade:
 *    Evitamos JPQL com SUBSTRING/CAST/CURRENT_DATE para não quebrar em bancos diferentes.
 *    Para "itens de hoje", use intervalo [inícioDoDia, fimDoDia].
 */
@Repository
public interface SadtRepository extends JpaRepository<Sadt, Long> {

    // ==============================
    // Identificadores / Numeração
    // ==============================

    /** Busca por número exato da SADT. */
    Optional<Sadt> findByNumeroSadt(String numeroSadt);

    /** Verificação rápida de duplicidade de número. */
    boolean existsByNumeroSadt(String numeroSadt);

    /**
     * Retorna a "maior" SADT para um prefixo (ex.: "20250903-"), ordenando lexicograficamente DESC.
     * Funciona porque a parte sequencial é zero-padded (000001, 000002, ...).
     * ÚTIL para o SadtNumeroService.
     */
    Optional<Sadt> findTopByNumeroSadtStartingWithOrderByNumeroSadtDesc(String prefix);

    /** Conta por prefixo (opcional – útil para relatórios). */
    long countByNumeroSadtStartingWith(String prefixo);

    // ==============================
    // Relacionamentos
    // ==============================

    /** Lista SADTs do paciente (mais recentes primeiro). */
    List<Sadt> findByPacienteIdOrderByDataEmissaoDesc(Long pacienteId);

    /** Lista SADTs de um agendamento (sem ordenação específica). */
    List<Sadt> findByAgendamentoId(Long agendamentoId);

    /** Lista SADTs de um agendamento (mais recentes primeiro). */
    List<Sadt> findByAgendamentoIdOrderByDataEmissaoDesc(Long agendamentoId);

    /** Última SADT criada para um agendamento (fallback para download). */
    Optional<Sadt> findTopByAgendamentoIdOrderByIdDesc(Long agendamentoId);

    // ==============================
    // Características / Filtros
    // ==============================

    /** Lista por tipo (mais recentes primeiro). */
    List<Sadt> findByTipoSadtOrderByDataEmissaoDesc(Sadt.TipoSadt tipoSadt);

    /** Lista por urgência (mais recentes primeiro). */
    List<Sadt> findByUrgenteOrderByDataEmissaoDesc(Boolean urgente);

    /** Lista por status (mais recentes primeiro). */
    List<Sadt> findByStatusOrderByDataEmissaoDesc(Sadt.StatusSadt status);

    // ==============================
    // Período / Relatórios
    // ==============================

    /**
     * SADTs emitidas em um intervalo (inclusive), ordenadas por dataEmissao DESC.
     * Use para "de hoje" passando [startOfDay, endOfDay] – evita CAST/CURRENT_DATE.
     */
    @Query("""
           SELECT s
             FROM Sadt s
            WHERE s.dataEmissao BETWEEN :dataInicio AND :dataFim
            ORDER BY s.dataEmissao DESC
           """)
    List<Sadt> findByPeriodo(@Param("dataInicio") LocalDateTime dataInicio,
                             @Param("dataFim") LocalDateTime dataFim);

    /** Contagem por TIPO em um intervalo. */
    @Query("""
           SELECT COUNT(s)
             FROM Sadt s
            WHERE s.tipoSadt = :tipo
              AND s.dataEmissao BETWEEN :dataInicio AND :dataFim
           """)
    Long countByTipoBetween(@Param("tipo") Sadt.TipoSadt tipo,
                            @Param("dataInicio") LocalDateTime dataInicio,
                            @Param("dataFim") LocalDateTime dataFim);

    /** Contagem por STATUS em um intervalo. */
    @Query("""
           SELECT COUNT(s)
             FROM Sadt s
            WHERE s.status = :status
              AND s.dataEmissao BETWEEN :dataInicio AND :dataFim
           """)
    Long countByStatusBetween(@Param("status") Sadt.StatusSadt status,
                              @Param("dataInicio") LocalDateTime dataInicio,
                              @Param("dataFim") LocalDateTime dataFim);

    /** Contagem por operador em um intervalo (mantida). */
    @Query("""
           SELECT COUNT(s)
             FROM Sadt s
            WHERE s.operador = :operador
              AND s.dataEmissao BETWEEN :dataInicio AND :dataFim
           """)
    Long countByOperadorAndPeriodo(@Param("operador") String operador,
                                   @Param("dataInicio") LocalDateTime dataInicio,
                                   @Param("dataFim") LocalDateTime dataFim);

    // ==============================
    // Dashboard / Paginação
    // ==============================

    /** Últimas SADTs (mais recentes primeiro) com paginação. */
    List<Sadt> findAllByOrderByDataEmissaoDesc(Pageable pageable);

    // ==============================
    // Reprocessamento de PDF
    // ==============================

    /** SADTs sem cache de PDF (base64 nulo/vazio), mais recentes primeiro. */
    @Query("""
           SELECT s
             FROM Sadt s
            WHERE s.pdfBase64 IS NULL OR s.pdfBase64 = ''
            ORDER BY s.dataEmissao DESC
           """)
    List<Sadt> findSadtsSemPdfCache();

    /** Busca SADT por código de barras. */
    Optional<Sadt> findByCodigoBarras(String codigoBarras);
}
