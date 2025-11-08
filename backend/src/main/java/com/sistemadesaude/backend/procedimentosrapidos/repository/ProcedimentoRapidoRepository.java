package com.sistemadesaude.backend.procedimentosrapidos.repository;

import com.sistemadesaude.backend.procedimentosrapidos.entity.ProcedimentoRapido;
import com.sistemadesaude.backend.procedimentosrapidos.enums.StatusProcedimento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProcedimentoRapidoRepository extends JpaRepository<ProcedimentoRapido, Long> {

    /**
     * Busca procedimentos por paciente
     */
    List<ProcedimentoRapido> findByPacienteIdOrderByDataCriacaoDesc(Long pacienteId);

    /**
     * Busca procedimentos por status
     */
    List<ProcedimentoRapido> findByStatusOrderByDataCriacaoDesc(StatusProcedimento status);

    /**
     * Busca procedimentos por período
     */
    @Query("""
        SELECT p FROM ProcedimentoRapido p
        WHERE p.dataCriacao BETWEEN :dataInicio AND :dataFim
        ORDER BY p.dataCriacao DESC
    """)
    List<ProcedimentoRapido> findByPeriodo(
        @Param("dataInicio") LocalDateTime dataInicio,
        @Param("dataFim") LocalDateTime dataFim
    );

    /**
     * Busca procedimentos por status e período
     */
    @Query("""
        SELECT p FROM ProcedimentoRapido p
        WHERE p.status = :status
        AND p.dataCriacao BETWEEN :dataInicio AND :dataFim
        ORDER BY p.dataCriacao DESC
    """)
    List<ProcedimentoRapido> findByStatusAndPeriodo(
        @Param("status") StatusProcedimento status,
        @Param("dataInicio") LocalDateTime dataInicio,
        @Param("dataFim") LocalDateTime dataFim
    );

    /**
     * Busca procedimentos bloqueados por um operador
     */
    List<ProcedimentoRapido> findByBloqueadoPorOperadorId(Long operadorId);

    /**
     * Busca procedimentos em atendimento por operador
     */
    @Query("""
        SELECT p FROM ProcedimentoRapido p
        WHERE p.operadorResponsavel.id = :operadorId
        AND p.status = 'EM_ATENDIMENTO'
        ORDER BY p.dataHoraInicioAtendimento DESC
    """)
    List<ProcedimentoRapido> findEmAtendimentoPorOperador(@Param("operadorId") Long operadorId);

    /**
     * Busca procedimento por ID com todas as associações carregadas
     */
    @Query("""
        SELECT DISTINCT p FROM ProcedimentoRapido p
        LEFT JOIN FETCH p.paciente
        LEFT JOIN FETCH p.operadorResponsavel
        LEFT JOIN FETCH p.atividades a
        WHERE p.id = :id
    """)
    Optional<ProcedimentoRapido> findByIdWithAssociations(@Param("id") Long id);

    /**
     * Busca procedimentos com atividades urgentes pendentes
     */
    @Query("""
        SELECT DISTINCT p FROM ProcedimentoRapido p
        JOIN p.atividades a
        WHERE a.urgente = true
        AND a.situacao = 'PENDENTE'
        AND p.status IN ('AGUARDANDO', 'EM_ATENDIMENTO')
        ORDER BY p.dataCriacao ASC
    """)
    List<ProcedimentoRapido> findWithAtividadesUrgentes();

    /**
     * Conta procedimentos por status em um período
     */
    @Query("""
        SELECT COUNT(p) FROM ProcedimentoRapido p
        WHERE p.status = :status
        AND p.dataCriacao BETWEEN :dataInicio AND :dataFim
    """)
    Long countByStatusAndPeriodo(
        @Param("status") StatusProcedimento status,
        @Param("dataInicio") LocalDateTime dataInicio,
        @Param("dataFim") LocalDateTime dataFim
    );

    /**
     * Busca procedimentos aguardando atendimento
     */
    @Query("""
        SELECT p FROM ProcedimentoRapido p
        WHERE p.status = 'AGUARDANDO'
        ORDER BY p.dataCriacao ASC
    """)
    List<ProcedimentoRapido> findAguardandoAtendimento();

    /**
     * Verifica se paciente tem procedimento ativo (AGUARDANDO ou EM_ATENDIMENTO)
     */
    @Query("""
        SELECT COUNT(p) > 0 FROM ProcedimentoRapido p
        WHERE p.paciente.id = :pacienteId
        AND p.status IN ('AGUARDANDO', 'EM_ATENDIMENTO')
    """)
    boolean temProcedimentoAtivo(@Param("pacienteId") Long pacienteId);

    /**
     * Busca procedimento ativo de um paciente
     */
    @Query(value = """
        SELECT * FROM procedimentos_rapidos p
        WHERE p.paciente_id = :pacienteId
        AND p.status IN ('AGUARDANDO', 'EM_ATENDIMENTO')
        ORDER BY p.data_criacao DESC
        LIMIT 1
    """, nativeQuery = true)
    Optional<ProcedimentoRapido> findProcedimentoAtivoPorPaciente(@Param("pacienteId") Long pacienteId);

    /**
     * Busca todos os procedimentos com associações carregadas
     */
    @Query("""
        SELECT DISTINCT p FROM ProcedimentoRapido p
        LEFT JOIN FETCH p.paciente
        LEFT JOIN FETCH p.operadorResponsavel
        LEFT JOIN FETCH p.atividades
        ORDER BY p.dataCriacao DESC
    """)
    List<ProcedimentoRapido> findAllWithAssociations();

    /**
     * Busca procedimentos com filtros avançados (termo de pesquisa)
     */
    @Query("""
        SELECT DISTINCT p FROM ProcedimentoRapido p
        LEFT JOIN FETCH p.paciente
        LEFT JOIN FETCH p.operadorResponsavel
        WHERE (
            UPPER(p.paciente.nomeCompleto) LIKE UPPER(CONCAT('%', :termo, '%'))
            OR UPPER(p.paciente.cpf) LIKE UPPER(CONCAT('%', :termo, '%'))
            OR UPPER(p.medicoSolicitante) LIKE UPPER(CONCAT('%', :termo, '%'))
            OR UPPER(p.especialidadeOrigem) LIKE UPPER(CONCAT('%', :termo, '%'))
            OR UPPER(p.origemEncaminhamento) LIKE UPPER(CONCAT('%', :termo, '%'))
            OR CAST(p.id AS string) LIKE CONCAT('%', :termo, '%')
        )
        ORDER BY p.dataCriacao DESC
    """)
    List<ProcedimentoRapido> buscarPorTermo(@Param("termo") String termo);

    /**
     * Busca procedimentos com múltiplos status
     */
    @Query("""
        SELECT p FROM ProcedimentoRapido p
        WHERE p.status IN :statuses
        ORDER BY p.dataCriacao DESC
    """)
    List<ProcedimentoRapido> findByStatusIn(@Param("statuses") List<StatusProcedimento> statuses);

    /**
     * Busca procedimentos por especialidade/origem
     */
    @Query("""
        SELECT p FROM ProcedimentoRapido p
        WHERE UPPER(p.especialidadeOrigem) LIKE UPPER(CONCAT('%', :especialidade, '%'))
        ORDER BY p.dataCriacao DESC
    """)
    List<ProcedimentoRapido> findByEspecialidade(@Param("especialidade") String especialidade);
}
