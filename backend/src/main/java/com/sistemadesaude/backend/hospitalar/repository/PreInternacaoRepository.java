package com.sistemadesaude.backend.hospitalar.repository;

import com.sistemadesaude.backend.hospitalar.entity.PreInternacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PreInternacaoRepository extends JpaRepository<PreInternacao, Long> {

    // Buscar por número de pré-internação
    Optional<PreInternacao> findByNumeroPreInternacao(String numeroPreInternacao);

    // Buscar por paciente
    List<PreInternacao> findByPacienteIdOrderByDataCriacaoDesc(Long pacienteId);

    // Buscar por status
    List<PreInternacao> findByStatusPreInternacaoOrderByDataPrevisaoInternacao(PreInternacao.StatusPreInternacao status);

    // Buscar previsões por data
    List<PreInternacao> findByDataPrevisaoInternacaoOrderByHoraPrevisaoInternacao(LocalDate dataPrevisao);

    // Buscar previsões do dia por unidade
    @Query("SELECT p FROM PreInternacao p WHERE p.dataPrevisaoInternacao = :data AND p.unidadeId = :unidadeId ORDER BY p.horaPrevisaoInternacao")
    List<PreInternacao> findPrevisoesDoDiaPorUnidade(@Param("data") LocalDate data, @Param("unidadeId") Long unidadeId);

    // Buscar por origem
    List<PreInternacao> findByOrigemAndStatusPreInternacaoOrderByDataPrevisaoInternacao(PreInternacao.OrigemPreInternacao origem, PreInternacao.StatusPreInternacao status);

    // Buscar aguardando leito
    @Query("SELECT p FROM PreInternacao p WHERE p.statusPreInternacao IN :statusList ORDER BY p.dataPrevisaoInternacao, p.horaPrevisaoInternacao")
    List<PreInternacao> findAguardandoLeito(@Param("statusList") List<PreInternacao.StatusPreInternacao> statusList);

    // Buscar por médico responsável
    List<PreInternacao> findByMedicoResponsavelIdAndStatusPreInternacaoOrderByDataPrevisaoInternacao(Long medicoId, PreInternacao.StatusPreInternacao status);

    // Buscar por regime
    List<PreInternacao> findByRegimeInternacaoAndStatusPreInternacaoOrderByDataPrevisaoInternacao(PreInternacao.RegimeInternacao regime, PreInternacao.StatusPreInternacao status);

    // Buscar por tipo de internação
    List<PreInternacao> findByTipoInternacaoAndStatusPreInternacaoOrderByDataPrevisaoInternacao(PreInternacao.TipoPreInternacao tipo, PreInternacao.StatusPreInternacao status);

    // Buscar por caráter de internação
    List<PreInternacao> findByCaraterInternacaoAndStatusPreInternacaoOrderByDataPrevisaoInternacao(PreInternacao.CaraterInternacao carater, PreInternacao.StatusPreInternacao status);

    // Buscar por convênio
    List<PreInternacao> findByConvenioIdAndStatusPreInternacaoOrderByDataPrevisaoInternacao(Long convenioId, PreInternacao.StatusPreInternacao status);

    // Buscar por agendamento cirúrgico
    Optional<PreInternacao> findByAgendamentoCirurgiaId(Long agendamentoCirurgiaId);

    // Buscar por atendimento de urgência
    Optional<PreInternacao> findByAtendimentoUrgenciaId(Long atendimentoUrgenciaId);

    // Buscar com leito reservado
    @Query("SELECT p FROM PreInternacao p WHERE p.leitoReservado IS NOT NULL AND p.statusPreInternacao = :status ORDER BY p.dataPrevisaoInternacao")
    List<PreInternacao> findComLeitoReservado(@Param("status") PreInternacao.StatusPreInternacao status);

    // Buscar com pendências
    @Query("SELECT p FROM PreInternacao p WHERE p.temPendencias = true AND p.statusPreInternacao IN :statusList ORDER BY p.dataPrevisaoInternacao")
    List<PreInternacao> findComPendencias(@Param("statusList") List<PreInternacao.StatusPreInternacao> statusList);

    // Buscar pré-internações vencidas
    @Query("SELECT p FROM PreInternacao p WHERE p.dataPrevisaoInternacao < :dataAtual AND p.statusPreInternacao IN :statusList")
    List<PreInternacao> findVencidas(@Param("dataAtual") LocalDate dataAtual, @Param("statusList") List<PreInternacao.StatusPreInternacao> statusList);

    // Buscar por tipo de acomodação
    List<PreInternacao> findByTipoAcomodacaoAndStatusPreInternacaoOrderByDataPrevisaoInternacao(PreInternacao.TipoAcomodacao tipoAcomodacao, PreInternacao.StatusPreInternacao status);

    // Buscar por enfermaria preferida
    List<PreInternacao> findByEnfermariaPreferidaAndStatusPreInternacaoOrderByDataPrevisaoInternacao(String enfermariaPreferida, PreInternacao.StatusPreInternacao status);

    // Buscar que precisam de isolamento
    @Query("SELECT p FROM PreInternacao p WHERE p.precisaIsolamento = true AND p.statusPreInternacao = :status ORDER BY p.dataPrevisaoInternacao")
    List<PreInternacao> findPrecisaIsolamento(@Param("status") PreInternacao.StatusPreInternacao status);

    // Buscar por período de previsão
    @Query("SELECT p FROM PreInternacao p WHERE p.dataPrevisaoInternacao BETWEEN :dataInicio AND :dataFim ORDER BY p.dataPrevisaoInternacao, p.horaPrevisaoInternacao")
    List<PreInternacao> findByPeriodoPrevisao(@Param("dataInicio") LocalDate dataInicio, @Param("dataFim") LocalDate dataFim);

    // Estatísticas - Contar por status
    @Query("SELECT p.statusPreInternacao, COUNT(p) FROM PreInternacao p WHERE p.unidadeId = :unidadeId GROUP BY p.statusPreInternacao")
    List<Object[]> countByStatusInUnidade(@Param("unidadeId") Long unidadeId);

    // Estatísticas - Contar por origem
    @Query("SELECT p.origem, COUNT(p) FROM PreInternacao p WHERE p.unidadeId = :unidadeId AND p.statusPreInternacao = :status GROUP BY p.origem")
    List<Object[]> countByOrigemInUnidade(@Param("unidadeId") Long unidadeId, @Param("status") PreInternacao.StatusPreInternacao status);

    // Estatísticas - Contar por tipo
    @Query("SELECT p.tipoInternacao, COUNT(p) FROM PreInternacao p WHERE p.unidadeId = :unidadeId AND p.statusPreInternacao = :status GROUP BY p.tipoInternacao")
    List<Object[]> countByTipoInUnidade(@Param("unidadeId") Long unidadeId, @Param("status") PreInternacao.StatusPreInternacao status);

    // Relatórios - Por médico e período
    @Query("SELECT p FROM PreInternacao p WHERE p.medicoResponsavelId = :medicoId AND p.dataPrevisaoInternacao BETWEEN :dataInicio AND :dataFim ORDER BY p.dataPrevisaoInternacao")
    List<PreInternacao> findByMedicoAndPeriodo(@Param("medicoId") Long medicoId, @Param("dataInicio") LocalDate dataInicio, @Param("dataFim") LocalDate dataFim);

    // Relatórios - Por serviço
    List<PreInternacao> findByServicoIdAndStatusPreInternacaoOrderByDataPrevisaoInternacao(Long servicoId, PreInternacao.StatusPreInternacao status);

    // Verificar disponibilidade de número
    boolean existsByNumeroPreInternacao(String numeroPreInternacao);

    // Buscar que solicitaram reserva de leito
    @Query("SELECT p FROM PreInternacao p WHERE p.solicitouReservaLeito = true AND p.statusPreInternacao = :status ORDER BY p.dataSolicitacaoLeito")
    List<PreInternacao> findSolicitaramReservaLeito(@Param("status") PreInternacao.StatusPreInternacao status);

    // Buscar por data de cirurgia (para integrações)
    @Query("SELECT p FROM PreInternacao p WHERE p.dataCirurgia = :dataCirurgia AND p.origem = :origem ORDER BY p.horaCirurgia")
    List<PreInternacao> findByCirurgiaDoDia(@Param("dataCirurgia") LocalDate dataCirurgia, @Param("origem") PreInternacao.OrigemPreInternacao origem);

    // Dashboard - Contadores rápidos
    @Query("SELECT COUNT(p) FROM PreInternacao p WHERE p.dataPrevisaoInternacao = :data AND p.statusPreInternacao IN :statusList")
    Long countPrevisoesDoDia(@Param("data") LocalDate data, @Param("statusList") List<PreInternacao.StatusPreInternacao> statusList);

    // Dashboard - Aguardando por prioridade
    @Query("SELECT p.caraterInternacao, COUNT(p) FROM PreInternacao p WHERE p.statusPreInternacao = :status GROUP BY p.caraterInternacao")
    List<Object[]> countAguardandoPorPrioridade(@Param("status") PreInternacao.StatusPreInternacao status);
}