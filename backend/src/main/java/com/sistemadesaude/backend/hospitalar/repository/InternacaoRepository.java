package com.sistemadesaude.backend.hospitalar.repository;

import com.sistemadesaude.backend.hospitalar.entity.Internacao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InternacaoRepository extends JpaRepository<Internacao, Long> {

    // Buscar internações ativas
    List<Internacao> findByStatusInternacaoOrderByDataInternacaoDesc(Internacao.StatusInternacao statusInternacao);

    // Buscar internações por paciente
    List<Internacao> findByPacienteIdOrderByDataInternacaoDesc(Long pacienteId);

    // Buscar internação ativa do paciente
    Optional<Internacao> findByPacienteIdAndStatusInternacao(Long pacienteId, Internacao.StatusInternacao statusInternacao);

    // Buscar por leito
    Optional<Internacao> findByLeitoIdAndStatusInternacao(Long leitoId, Internacao.StatusInternacao statusInternacao);

    // Buscar por número de internação
    Optional<Internacao> findByNumeroInternacao(String numeroInternacao);

    // Buscar por unidade
    List<Internacao> findByUnidadeIdAndStatusInternacaoOrderByDataInternacaoDesc(Long unidadeId, Internacao.StatusInternacao statusInternacao);

    // Buscar por médico responsável
    List<Internacao> findByMedicoResponsavelIdAndStatusInternacaoOrderByDataInternacaoDesc(Long medicoId, Internacao.StatusInternacao statusInternacao);

    // Buscar por período de internação
    @Query("SELECT i FROM Internacao i WHERE i.dataInternacao BETWEEN :dataInicio AND :dataFim ORDER BY i.dataInternacao DESC")
    List<Internacao> findByPeriodoInternacao(@Param("dataInicio") LocalDate dataInicio, @Param("dataFim") LocalDate dataFim);

    // Buscar por período de alta
    @Query("SELECT i FROM Internacao i WHERE i.dataAlta BETWEEN :dataInicio AND :dataFim ORDER BY i.dataAlta DESC")
    List<Internacao> findByPeriodoAlta(@Param("dataInicio") LocalDate dataInicio, @Param("dataFim") LocalDate dataFim);

    // Buscar internações por regime
    List<Internacao> findByRegimeInternacaoAndStatusInternacaoOrderByDataInternacaoDesc(Internacao.RegimeInternacao regimeInternacao, Internacao.StatusInternacao statusInternacao);

    // Buscar internações por tipo
    List<Internacao> findByTipoInternacaoAndStatusInternacaoOrderByDataInternacaoDesc(Internacao.TipoInternacao tipoInternacao, Internacao.StatusInternacao statusInternacao);

    // Estatísticas - Contar por status
    @Query("SELECT i.statusInternacao, COUNT(i) FROM Internacao i WHERE i.unidadeId = :unidadeId GROUP BY i.statusInternacao")
    List<Object[]> countByStatusInUnidade(@Param("unidadeId") Long unidadeId);

    // Estatísticas - Contar por regime
    @Query("SELECT i.regimeInternacao, COUNT(i) FROM Internacao i WHERE i.unidadeId = :unidadeId AND i.statusInternacao = :status GROUP BY i.regimeInternacao")
    List<Object[]> countByRegimeInUnidade(@Param("unidadeId") Long unidadeId, @Param("status") Internacao.StatusInternacao status);

    // Estatísticas - Contar por tipo
    @Query("SELECT i.tipoInternacao, COUNT(i) FROM Internacao i WHERE i.unidadeId = :unidadeId AND i.statusInternacao = :status GROUP BY i.tipoInternacao")
    List<Object[]> countByTipoInUnidade(@Param("unidadeId") Long unidadeId, @Param("status") Internacao.StatusInternacao status);

    // Relatórios - Internações por período e médico
    @Query("SELECT i FROM Internacao i WHERE i.medicoResponsavelId = :medicoId AND i.dataInternacao BETWEEN :dataInicio AND :dataFim ORDER BY i.dataInternacao DESC")
    List<Internacao> findByMedicoAndPeriodo(@Param("medicoId") Long medicoId, @Param("dataInicio") LocalDate dataInicio, @Param("dataFim") LocalDate dataFim);

    // Relatórios - Altas do dia
    @Query("SELECT i FROM Internacao i WHERE i.dataAlta = :data ORDER BY i.horaAlta")
    List<Internacao> findAltasDoDia(@Param("data") LocalDate data);

    // Relatórios - Internações do dia
    @Query("SELECT i FROM Internacao i WHERE i.dataInternacao = :data ORDER BY i.horaInternacao")
    List<Internacao> findInternacoesDoDia(@Param("data") LocalDate data);

    // Relatórios - Previsão de altas
    @Query("SELECT i FROM Internacao i WHERE i.dataPrevistaAlta = :data AND i.statusInternacao = :status ORDER BY i.dataPrevistaAlta")
    List<Internacao> findPrevisaoAltasDoDia(@Param("data") LocalDate data, @Param("status") Internacao.StatusInternacao status);

    // Censo hospitalar - Internações ativas por enfermaria
    @Query("SELECT l.enfermaria, COUNT(i) FROM Internacao i JOIN i.leito l WHERE i.statusInternacao = :status AND i.unidadeId = :unidadeId GROUP BY l.enfermaria")
    List<Object[]> censoOcupacionalPorEnfermaria(@Param("unidadeId") Long unidadeId, @Param("status") Internacao.StatusInternacao status);

    // Tempo médio de internação
    @Query("SELECT AVG(i.diasInternacao) FROM Internacao i WHERE i.statusInternacao IN :statusList AND i.dataAlta BETWEEN :dataInicio AND :dataFim")
    Double tempoMedioInternacao(@Param("statusList") List<Internacao.StatusInternacao> statusList, @Param("dataInicio") LocalDate dataInicio, @Param("dataFim") LocalDate dataFim);

    // Buscar internações com acompanhante
    @Query("SELECT i FROM Internacao i WHERE i.permiteAcompanhante = true AND i.statusInternacao = :status ORDER BY i.dataInternacao DESC")
    List<Internacao> findComAcompanhante(@Param("status") Internacao.StatusInternacao status);

    // Verificar disponibilidade de número de internação
    boolean existsByNumeroInternacao(String numeroInternacao);

    // Buscar internações por CID principal
    List<Internacao> findByCidPrincipalAndStatusInternacaoOrderByDataInternacaoDesc(String cidPrincipal, Internacao.StatusInternacao statusInternacao);

    // Buscar internações que precisam de alta programada
    @Query("SELECT i FROM Internacao i WHERE i.dataPrevistaAlta <= :dataLimite AND i.statusInternacao = :status ORDER BY i.dataPrevistaAlta")
    List<Internacao> findPrecisamAltaProgramada(@Param("dataLimite") LocalDate dataLimite, @Param("status") Internacao.StatusInternacao status);

    // Pacientes internados há mais de X dias
    @Query("SELECT i FROM Internacao i WHERE i.diasInternacao > :diasLimite AND i.statusInternacao = :status ORDER BY i.diasInternacao DESC")
    List<Internacao> findInternacaoesLongas(@Param("diasLimite") Integer diasLimite, @Param("status") Internacao.StatusInternacao status);

    // Buscar por convênio
    List<Internacao> findByConvenioIdAndStatusInternacaoOrderByDataInternacaoDesc(Long convenioId, Internacao.StatusInternacao statusInternacao);

    // Métodos para paginação
    Page<Internacao> findByStatusInternacao(Internacao.StatusInternacao status, Pageable pageable);
}