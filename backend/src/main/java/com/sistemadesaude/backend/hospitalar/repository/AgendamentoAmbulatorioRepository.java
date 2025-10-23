package com.sistemadesaude.backend.hospitalar.repository;

import com.sistemadesaude.backend.hospitalar.entity.AgendamentoAmbulatorio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AgendamentoAmbulatorioRepository extends JpaRepository<AgendamentoAmbulatorio, Long> {

    // Buscar agendamentos por paciente
    List<AgendamentoAmbulatorio> findByPacienteIdOrderByDataAgendamentoDescHoraAgendamentoDesc(Long pacienteId);

    // Buscar agendamentos por profissional e data
    List<AgendamentoAmbulatorio> findByProfissionalIdAndDataAgendamentoOrderByHoraAgendamento(Long profissionalId, LocalDate dataAgendamento);

    // Buscar agendamentos por unidade e data
    List<AgendamentoAmbulatorio> findByUnidadeIdAndDataAgendamentoOrderByHoraAgendamento(Long unidadeId, LocalDate dataAgendamento);

    // Buscar agendamentos por especialidade e período
    @Query("SELECT a FROM AgendamentoAmbulatorio a WHERE a.especialidadeId = :especialidadeId " +
           "AND a.dataAgendamento BETWEEN :dataInicio AND :dataFim " +
           "ORDER BY a.dataAgendamento, a.horaAgendamento")
    List<AgendamentoAmbulatorio> findByEspecialidadeAndPeriodo(
            @Param("especialidadeId") Long especialidadeId,
            @Param("dataInicio") LocalDate dataInicio,
            @Param("dataFim") LocalDate dataFim);

    // Buscar agendamentos por status
    List<AgendamentoAmbulatorio> findByStatusAgendamentoOrderByDataAgendamentoDescHoraAgendamentoDesc(
            AgendamentoAmbulatorio.StatusAgendamento status);

    // Buscar agendamentos confirmados para uma data específica
    @Query("SELECT a FROM AgendamentoAmbulatorio a WHERE a.dataAgendamento = :data " +
           "AND a.statusAgendamento IN ('CONFIRMADO', 'PRESENTE', 'CHAMADO', 'EM_ATENDIMENTO') " +
           "ORDER BY a.horaAgendamento")
    List<AgendamentoAmbulatorio> findAgendamentosConfirmadosPorData(@Param("data") LocalDate data);

    // Buscar pacientes presentes aguardando chamada
    @Query("SELECT a FROM AgendamentoAmbulatorio a WHERE a.dataAgendamento = :data " +
           "AND a.statusAgendamento = 'PRESENTE' " +
           "ORDER BY a.prioridade DESC, a.horaAgendamento")
    List<AgendamentoAmbulatorio> findPacientesAguardandoChamada(@Param("data") LocalDate data);

    // Buscar agendamentos em atendimento
    @Query("SELECT a FROM AgendamentoAmbulatorio a WHERE a.statusAgendamento = 'EM_ATENDIMENTO' " +
           "AND a.dataAgendamento = :data ORDER BY a.dataInicioAtendimento")
    List<AgendamentoAmbulatorio> findAgendamentosEmAtendimento(@Param("data") LocalDate data);

    // Contar agendamentos por profissional em um período
    @Query("SELECT COUNT(a) FROM AgendamentoAmbulatorio a WHERE a.profissionalId = :profissionalId " +
           "AND a.dataAgendamento BETWEEN :dataInicio AND :dataFim")
    Long countByProfissionalAndPeriodo(
            @Param("profissionalId") Long profissionalId,
            @Param("dataInicio") LocalDate dataInicio,
            @Param("dataFim") LocalDate dataFim);

    // Buscar agendamentos por tipo de consulta
    List<AgendamentoAmbulatorio> findByTipoConsultaAndDataAgendamentoBetweenOrderByDataAgendamento(
            AgendamentoAmbulatorio.TipoConsulta tipoConsulta,
            LocalDate dataInicio,
            LocalDate dataFim);

    // Buscar agendamentos de retorno vencidos
    @Query("SELECT a FROM AgendamentoAmbulatorio a WHERE a.retornoProgramado = true " +
           "AND a.dataAgendamento < :dataAtual " +
           "AND a.statusAgendamento IN ('AGENDADO', 'CONFIRMADO') " +
           "ORDER BY a.dataAgendamento")
    List<AgendamentoAmbulatorio> findRetornosVencidos(@Param("dataAtual") LocalDate dataAtual);

    // Buscar por encaminhamento interno
    List<AgendamentoAmbulatorio> findByEncaminhamentoInternoTrueAndStatusAgendamento(
            AgendamentoAmbulatorio.StatusAgendamento status);

    // Verificar conflito de horário
    @Query("SELECT a FROM AgendamentoAmbulatorio a WHERE a.profissionalId = :profissionalId " +
           "AND a.dataAgendamento = :data " +
           "AND a.horaAgendamento = :hora " +
           "AND a.statusAgendamento NOT IN ('CANCELADO', 'ATENDIDO', 'FALTOU') " +
           "AND (:id IS NULL OR a.id != :id)")
    Optional<AgendamentoAmbulatorio> findConflitoHorario(
            @Param("profissionalId") Long profissionalId,
            @Param("data") LocalDate data,
            @Param("hora") java.time.LocalTime hora,
            @Param("id") Long id);

    // Buscar agendamentos para confirmação
    @Query("SELECT a FROM AgendamentoAmbulatorio a WHERE a.dataAgendamento = :dataAgendamento " +
           "AND a.statusAgendamento = 'AGENDADO' " +
           "ORDER BY a.horaAgendamento")
    List<AgendamentoAmbulatorio> findAgendamentosParaConfirmacao(@Param("dataAgendamento") LocalDate dataAgendamento);

    // Estatísticas de agendamentos por período
    @Query("SELECT a.statusAgendamento, COUNT(a) FROM AgendamentoAmbulatorio a " +
           "WHERE a.dataAgendamento BETWEEN :dataInicio AND :dataFim " +
           "GROUP BY a.statusAgendamento")
    List<Object[]> countByStatusAndPeriodo(
            @Param("dataInicio") LocalDate dataInicio,
            @Param("dataFim") LocalDate dataFim);

    // Buscar próximos agendamentos do paciente
    @Query("SELECT a FROM AgendamentoAmbulatorio a WHERE a.paciente.id = :pacienteId " +
           "AND a.dataAgendamento >= :dataAtual " +
           "AND a.statusAgendamento IN ('AGENDADO', 'CONFIRMADO') " +
           "ORDER BY a.dataAgendamento, a.horaAgendamento")
    List<AgendamentoAmbulatorio> findProximosAgendamentos(
            @Param("pacienteId") Long pacienteId,
            @Param("dataAtual") LocalDate dataAtual);
}