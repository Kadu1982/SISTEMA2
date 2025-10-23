package com.sistemadesaude.backend.hospitalar.repository;

import com.sistemadesaude.backend.hospitalar.entity.SolicitacaoLeito;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SolicitacaoLeitoRepository extends JpaRepository<SolicitacaoLeito, Long> {

    List<SolicitacaoLeito> findByStatus(String status);

    List<SolicitacaoLeito> findByPacienteId(Long pacienteId);

    List<SolicitacaoLeito> findByMedicoSolicitanteId(Long medicoId);

    @Query("SELECT sl FROM SolicitacaoLeito sl WHERE sl.status IN ('SOLICITADO', 'EM_ANALISE') " +
            "ORDER BY sl.prioridade DESC, sl.dataSolicitacao ASC")
    List<SolicitacaoLeito> findSolicitacoesPendentes();

    @Query("SELECT sl FROM SolicitacaoLeito sl WHERE sl.tipoAcomodacaoSolicitada = :tipo AND " +
            "sl.status IN ('SOLICITADO', 'EM_ANALISE')")
    List<SolicitacaoLeito> findByTipoAcomodacaoAndPendente(@Param("tipo") String tipo);

    @Query("SELECT sl FROM SolicitacaoLeito sl WHERE sl.prioridade = :prioridade AND " +
            "sl.status IN ('SOLICITADO', 'EM_ANALISE') ORDER BY sl.dataSolicitacao ASC")
    List<SolicitacaoLeito> findByPrioridadeAndPendente(@Param("prioridade") String prioridade);

    @Query("SELECT sl FROM SolicitacaoLeito sl WHERE sl.especialidadeSolicitada = :especialidade AND " +
            "sl.status IN ('SOLICITADO', 'EM_ANALISE')")
    List<SolicitacaoLeito> findByEspecialidadeAndPendente(@Param("especialidade") String especialidade);

    @Query("SELECT sl FROM SolicitacaoLeito sl WHERE sl.dataSolicitacao BETWEEN :dataInicio AND :dataFim")
    Page<SolicitacaoLeito> findByPeriodoSolicitacao(
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim,
            Pageable pageable);

    List<SolicitacaoLeito> findByLeitoReservadoId(Long leitoId);

    @Query("SELECT sl FROM SolicitacaoLeito sl WHERE sl.responsavelReserva.id = :operadorId AND " +
            "sl.dataReserva BETWEEN :dataInicio AND :dataFim")
    List<SolicitacaoLeito> findByResponsavelReservaAndPeriodo(
            @Param("operadorId") Long operadorId,
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim);

    @Query("SELECT sl FROM SolicitacaoLeito sl WHERE sl.status = 'RESERVADO' AND " +
            "sl.dataNecessidade < :dataLimite")
    List<SolicitacaoLeito> findReservasVencidas(@Param("dataLimite") LocalDateTime dataLimite);

    @Query("SELECT sl FROM SolicitacaoLeito sl WHERE sl.atendimentoId = :atendimentoId")
    List<SolicitacaoLeito> findByAtendimentoId(@Param("atendimentoId") Long atendimentoId);

    @Query("SELECT COUNT(sl) FROM SolicitacaoLeito sl WHERE sl.status = :status AND " +
            "sl.dataSolicitacao BETWEEN :dataInicio AND :dataFim")
    Long countByStatusAndPeriodo(
            @Param("status") String status,
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim);

    @Query("SELECT sl.tipoAcomodacaoSolicitada, COUNT(sl) FROM SolicitacaoLeito sl WHERE " +
            "sl.dataSolicitacao BETWEEN :dataInicio AND :dataFim GROUP BY sl.tipoAcomodacaoSolicitada")
    List<Object[]> getEstatisticasPorTipoAcomodacao(
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim);

    @Query("SELECT sl.prioridade, COUNT(sl) FROM SolicitacaoLeito sl WHERE " +
            "sl.dataSolicitacao BETWEEN :dataInicio AND :dataFim GROUP BY sl.prioridade")
    List<Object[]> getEstatisticasPorPrioridade(
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim);

    @Query(value = "SELECT AVG(EXTRACT(EPOCH FROM (data_atendimento - data_solicitacao))/3600) " +
            "FROM solicitacao_leito WHERE status = 'ATENDIDO' AND " +
            "data_solicitacao BETWEEN :dataInicio AND :dataFim", nativeQuery = true)
    Double getTempoMedioAtendimento(
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim);
}