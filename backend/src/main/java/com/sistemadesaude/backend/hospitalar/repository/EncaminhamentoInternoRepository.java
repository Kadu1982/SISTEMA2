package com.sistemadesaude.backend.hospitalar.repository;

import com.sistemadesaude.backend.hospitalar.entity.EncaminhamentoInterno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EncaminhamentoInternoRepository extends JpaRepository<EncaminhamentoInterno, Long> {

    // Buscar encaminhamentos por paciente
    List<EncaminhamentoInterno> findByPacienteIdOrderByDataEncaminhamentoDesc(Long pacienteId);

    // Buscar encaminhamentos por profissional origem
    List<EncaminhamentoInterno> findByProfissionalOrigemIdOrderByDataEncaminhamentoDesc(Long profissionalOrigemId);

    // Buscar encaminhamentos por especialidade destino
    List<EncaminhamentoInterno> findByEspecialidadeDestinoIdOrderByDataEncaminhamentoDesc(Long especialidadeDestinoId);

    // Buscar encaminhamentos por status
    List<EncaminhamentoInterno> findByStatusEncaminhamentoOrderByDataEncaminhamentoDesc(
            EncaminhamentoInterno.StatusEncaminhamento status);

    // Buscar encaminhamentos pendentes
    @Query("SELECT e FROM EncaminhamentoInterno e WHERE e.statusEncaminhamento = 'PENDENTE' " +
           "ORDER BY e.prioridade DESC, e.dataEncaminhamento")
    List<EncaminhamentoInterno> findEncaminhamentosPendentes();

    // Buscar encaminhamentos urgentes
    @Query("SELECT e FROM EncaminhamentoInterno e WHERE e.urgente = true " +
           "AND e.statusEncaminhamento IN ('PENDENTE', 'AGENDADO') " +
           "ORDER BY e.dataEncaminhamento")
    List<EncaminhamentoInterno> findEncaminhamentosUrgentes();

    // Buscar encaminhamentos por prioridade
    List<EncaminhamentoInterno> findByPrioridadeAndStatusEncaminhamentoOrderByDataEncaminhamento(
            EncaminhamentoInterno.PrioridadeEncaminhamento prioridade,
            EncaminhamentoInterno.StatusEncaminhamento status);

    // Buscar encaminhamentos por tipo
    List<EncaminhamentoInterno> findByTipoEncaminhamentoAndStatusEncaminhamentoOrderByDataEncaminhamento(
            EncaminhamentoInterno.TipoEncaminhamento tipo,
            EncaminhamentoInterno.StatusEncaminhamento status);

    // Buscar encaminhamentos vencidos
    @Query("SELECT e FROM EncaminhamentoInterno e WHERE e.statusEncaminhamento = 'PENDENTE' " +
           "AND e.prazoDias IS NOT NULL " +
           "AND e.dataEncaminhamento < :dataLimite " +
           "ORDER BY e.dataEncaminhamento")
    List<EncaminhamentoInterno> findEncaminhamentosVencidos(@Param("dataLimite") LocalDateTime dataLimite);

    // Buscar por especialidade origem e destino
    @Query("SELECT e FROM EncaminhamentoInterno e WHERE e.especialidadeOrigemId = :especialidadeOrigemId " +
           "AND e.especialidadeDestinoId = :especialidadeDestinoId " +
           "ORDER BY e.dataEncaminhamento DESC")
    List<EncaminhamentoInterno> findByEspecialidadeOrigemAndDestino(
            @Param("especialidadeOrigemId") Long especialidadeOrigemId,
            @Param("especialidadeDestinoId") Long especialidadeDestinoId);

    // Contar encaminhamentos por status em período
    @Query("SELECT e.statusEncaminhamento, COUNT(e) FROM EncaminhamentoInterno e " +
           "WHERE e.dataEncaminhamento BETWEEN :dataInicio AND :dataFim " +
           "GROUP BY e.statusEncaminhamento")
    List<Object[]> countByStatusAndPeriodo(
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim);

    // Buscar encaminhamentos agendados para uma data
    @Query("SELECT e FROM EncaminhamentoInterno e WHERE DATE(e.dataAgendamento) = DATE(:data) " +
           "AND e.statusEncaminhamento = 'AGENDADO' " +
           "ORDER BY e.dataAgendamento")
    List<EncaminhamentoInterno> findEncaminhamentosAgendadosParaData(@Param("data") LocalDateTime data);

    // Buscar encaminhamentos por unidade destino
    List<EncaminhamentoInterno> findByUnidadeDestinoIdAndStatusEncaminhamentoOrderByDataEncaminhamento(
            Long unidadeDestinoId, EncaminhamentoInterno.StatusEncaminhamento status);

    // Buscar encaminhamentos por atendimento origem
    List<EncaminhamentoInterno> findByAtendimentoOrigemIdOrderByDataEncaminhamento(Long atendimentoOrigemId);

    // Buscar encaminhamentos por agendamento origem
    List<EncaminhamentoInterno> findByAgendamentoOrigemIdOrderByDataEncaminhamento(Long agendamentoOrigemId);
}