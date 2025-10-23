package com.sistemadesaude.backend.recepcao.repository;

import com.sistemadesaude.backend.recepcao.entity.AgendamentoExame;
import com.sistemadesaude.backend.recepcao.entity.AgendamentoExame.StatusAgendamentoExame;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository para gerenciamento de agendamentos de exames
 */
@Repository
public interface AgendamentoExameRepository extends JpaRepository<AgendamentoExame, Long> {
    
    /**
     * Busca agendamento por protocolo
     */
    Optional<AgendamentoExame> findByProtocolo(String protocolo);
    
    /**
     * Lista agendamentos por paciente
     */
    List<AgendamentoExame> findByPacienteIdOrderByDataHoraExameDesc(Long pacienteId);
    
    /**
     * Lista agendamentos por data
     */
    @Query("SELECT a FROM AgendamentoExame a WHERE " +
           "DATE(a.dataHoraExame) = DATE(:data) " +
           "ORDER BY a.dataHoraExame")
    List<AgendamentoExame> findByData(@Param("data") LocalDateTime data);
    
    /**
     * Lista agendamentos por período
     */
    List<AgendamentoExame> findByDataHoraExameBetweenOrderByDataHoraExame(
            LocalDateTime dataInicio, 
            LocalDateTime dataFim);
    
    /**
     * Lista agendamentos por status
     */
    List<AgendamentoExame> findByStatusOrderByDataHoraExame(StatusAgendamentoExame status);
    
    /**
     * Lista agendamentos por status em uma lista
     */
    List<AgendamentoExame> findByStatusInOrderByDataHoraExame(List<StatusAgendamentoExame> status);
    
    /**
     * Lista agendamentos por profissional
     */
    List<AgendamentoExame> findByProfissionalIdAndDataHoraExameBetween(
            Long profissionalId,
            LocalDateTime dataInicio,
            LocalDateTime dataFim);
    
    /**
     * Lista agendamentos por sala
     */
    List<AgendamentoExame> findBySalaIdAndDataHoraExameBetween(
            Long salaId,
            LocalDateTime dataInicio,
            LocalDateTime dataFim);
    
    /**
     * Lista agendamentos por unidade
     */
    List<AgendamentoExame> findByUnidadeIdOrderByDataHoraExameDesc(Long unidadeId);
    
    /**
     * Conta agendamentos por horário para verificar disponibilidade
     */
    @Query("SELECT COUNT(a) FROM AgendamentoExame a WHERE " +
           "a.horarioExame.id = :horarioExameId AND " +
           "a.dataHoraExame = :dataHora AND " +
           "a.status NOT IN ('CANCELADO', 'NAO_COMPARECEU')")
    Long countAgendamentosPorHorario(
            @Param("horarioExameId") Long horarioExameId,
            @Param("dataHora") LocalDateTime dataHora);
    
    /**
     * Verifica conflito de horário para profissional
     */
    @Query("SELECT COUNT(a) > 0 FROM AgendamentoExame a WHERE " +
           "a.profissionalId = :profissionalId AND " +
           "a.dataHoraExame = :dataHora AND " +
           "a.status NOT IN ('CANCELADO', 'NAO_COMPARECEU')")
    boolean existsConflitoProfissional(
            @Param("profissionalId") Long profissionalId,
            @Param("dataHora") LocalDateTime dataHora);
    
    /**
     * Verifica conflito de horário para sala
     */
    @Query("SELECT COUNT(a) > 0 FROM AgendamentoExame a WHERE " +
           "a.salaId = :salaId AND " +
           "a.dataHoraExame = :dataHora AND " +
           "a.status NOT IN ('CANCELADO', 'NAO_COMPARECEU')")
    boolean existsConflitoSala(
            @Param("salaId") Long salaId,
            @Param("dataHora") LocalDateTime dataHora);
    
    /**
     * Busca agendamentos pendentes de confirmação
     */
    @Query("SELECT a FROM AgendamentoExame a WHERE " +
           "a.status = 'AGENDADO' AND " +
           "a.confirmado = false AND " +
           "a.dataHoraExame > :dataAtual " +
           "ORDER BY a.dataHoraExame")
    List<AgendamentoExame> findPendentesConfirmacao(@Param("dataAtual") LocalDateTime dataAtual);
    
    /**
     * Busca agendamentos não realizados para data passada
     */
    @Query("SELECT a FROM AgendamentoExame a WHERE " +
           "a.dataHoraExame < :dataAtual AND " +
           "a.status IN ('AGENDADO', 'CONFIRMADO', 'AGUARDANDO_ATENDIMENTO') " +
           "ORDER BY a.dataHoraExame")
    List<AgendamentoExame> findAtrasados(@Param("dataAtual") LocalDateTime dataAtual);
    
    /**
     * Lista agendamentos do dia para profissional
     */
    @Query("SELECT a FROM AgendamentoExame a WHERE " +
           "a.profissionalId = :profissionalId AND " +
           "DATE(a.dataHoraExame) = DATE(:data) AND " +
           "a.status NOT IN ('CANCELADO') " +
           "ORDER BY a.dataHoraExame")
    List<AgendamentoExame> findAgendaDiaProfissional(
            @Param("profissionalId") Long profissionalId,
            @Param("data") LocalDateTime data);
    
    /**
     * Estatísticas de agendamentos por período
     */
    @Query("SELECT " +
           "COUNT(CASE WHEN a.status = 'REALIZADO' THEN 1 END) as realizados, " +
           "COUNT(CASE WHEN a.status = 'CANCELADO' THEN 1 END) as cancelados, " +
           "COUNT(CASE WHEN a.status = 'NAO_COMPARECEU' THEN 1 END) as naoCompareceu, " +
           "COUNT(a) as total " +
           "FROM AgendamentoExame a " +
           "WHERE a.dataHoraExame BETWEEN :dataInicio AND :dataFim")
    Object[] getEstatisticasPeriodo(
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim);
}