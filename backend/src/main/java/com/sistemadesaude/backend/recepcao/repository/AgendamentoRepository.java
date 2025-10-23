
package com.sistemadesaude.backend.recepcao.repository;

import com.sistemadesaude.backend.recepcao.entity.Agendamento;
import com.sistemadesaude.backend.recepcao.entity.StatusAgendamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {

    /**
     * Busca um agendamento ativo para um paciente em um determinado período.
     * ✅ CORRIGIDO: A query agora usa a relação 'paciente.id' em vez do campo 'pacienteId' que foi removido.
     */
    @Query("SELECT a FROM Agendamento a WHERE a.paciente.id = :pacienteId AND a.status = 'AGENDADO' AND a.dataHora BETWEEN :inicio AND :fim ORDER BY a.dataHora ASC")
    Optional<Agendamento> findAgendamentoAtivoPorPaciente(@Param("pacienteId") Long pacienteId, @Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    /**
     * Busca todos os agendamentos dentro de um intervalo de datas, ordenado de forma ascendente.
     */
    List<Agendamento> findByDataHoraBetweenOrderByDataHoraAsc(LocalDateTime inicio, LocalDateTime fim);

    /**
     * ✅ CORRIGIDO: Busca todos os agendamentos de um paciente, ordenado do mais recente para o mais antigo.
     * Mudança de método derivado para @Query devido ao relacionamento com Paciente.
     */
    @Query("SELECT a FROM Agendamento a WHERE a.paciente.id = :pacienteId ORDER BY a.dataHora DESC")
    List<Agendamento> findByPacienteIdOrderByDataHoraDesc(@Param("pacienteId") Long pacienteId);

    /**
     * Busca todos os agendamentos dentro de um intervalo de datas (sem ordenação explícita).
     */
    List<Agendamento> findByDataHoraBetweenOrderByDataHora(LocalDateTime inicio, LocalDateTime fim);

    /**
     * ✅ CORRIGIDO: Busca todos os agendamentos de um paciente (sem ordenação explícita).
     * Mudança de método derivado para @Query devido ao relacionamento com Paciente.
     */
    @Query("SELECT a FROM Agendamento a WHERE a.paciente.id = :pacienteId")
    List<Agendamento> findByPacienteId(@Param("pacienteId") Long pacienteId);

    /**
     * ✅ ESSENCIAL: Busca agendamentos com os status fornecidos e que ainda não têm uma triagem associada.
     * Usado para encontrar pacientes que estão aguardando triagem.
     */
    List<Agendamento> findByStatusInAndTriagemIsNull(List<StatusAgendamento> statuses);

    /**
     * ✅ NOVO: Busca agendamentos por período, status e sem triagem
     * Usado para filtrar pacientes aguardando triagem por data específica
     */
    List<Agendamento> findByDataHoraBetweenAndStatusInAndTriagemIsNull(
            LocalDateTime inicio,
            LocalDateTime fim,
            List<StatusAgendamento> statuses
    );

    /**
     * ✅ NOVO: Busca datas e quantidades de pacientes recepcionados para triagem
     * Retorna array com [data, quantidade] para construir indicadores do calendário
     */
    @Query("""
        SELECT DATE(a.dataHora) as data, COUNT(a.id) as quantidade
        FROM Agendamento a 
        WHERE a.dataHora BETWEEN :dataInicio AND :dataFim 
        AND a.status IN :statuses 
        AND a.triagem IS NULL
        GROUP BY DATE(a.dataHora)
        ORDER BY DATE(a.dataHora) ASC
        """)
    List<Object[]> findDatasComQuantidadePacientesRecepcionados(
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim,
            @Param("statuses") List<StatusAgendamento> statuses
    );

    /**
     * ✅ NOVA: Busca agendamentos com status específico e que JÁ têm triagem associada.
     * Usado para encontrar pacientes que já foram triados e estão aguardando atendimento médico.
     */
    List<Agendamento> findByStatusAndTriagemIsNotNull(StatusAgendamento status);

    /**
     * ✅ NOVA: Busca agendamentos por status específico.
     * Método genérico para buscar por qualquer status.
     */
    List<Agendamento> findByStatus(StatusAgendamento status);

    /**
     * ✅ NOVA: Busca agendamentos que têm triagem associada (independente do status).
     * Útil para relatórios e estatísticas.
     */
    List<Agendamento> findByTriagemIsNotNull();

    /**
     * ✅ CORRIGIDO: Conta quantos agendamentos têm triagem hoje usando parâmetros.
     * Usado para estatísticas do dashboard.
     * CORREÇÃO DEFINITIVA: Usando 'dataTriagem' conforme a entidade Triagem
     */
    @Query("SELECT COUNT(a) FROM Agendamento a JOIN a.triagem t WHERE t.dataTriagem >= :inicioHoje AND t.dataTriagem < :fimHoje")
    Long countAgendamentosComTriagemHoje(@Param("inicioHoje") LocalDateTime inicioHoje, @Param("fimHoje") LocalDateTime fimHoje);

    /**
     * ✅ NOVA: Busca agendamentos triados em um período para relatórios.
     */
    @Query("SELECT a FROM Agendamento a WHERE a.triagem IS NOT NULL AND a.dataHora BETWEEN :inicio AND :fim ORDER BY a.dataHora DESC")
    List<Agendamento> findAgendamentosTriadosNoPeriodo(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    /**
     * Busca agendamento por código de barras
     */
    Optional<Agendamento> findByCodigoBarras(String codigoBarras);
}