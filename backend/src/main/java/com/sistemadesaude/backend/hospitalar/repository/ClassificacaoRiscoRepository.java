package com.sistemadesaude.backend.hospitalar.repository;

import com.sistemadesaude.backend.hospitalar.entity.ClassificacaoRisco;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClassificacaoRiscoRepository extends JpaRepository<ClassificacaoRisco, Long> {

    List<ClassificacaoRisco> findByPaciente_IdOrderByDataClassificacaoDesc(Long pacienteId);

    Optional<ClassificacaoRisco> findTopByPaciente_IdOrderByDataClassificacaoDesc(Long pacienteId);

    List<ClassificacaoRisco> findByAtendimentoId(Long atendimentoId);

    @Query("SELECT cr FROM ClassificacaoRisco cr WHERE cr.corPrioridade = :cor AND " +
           "cr.dataClassificacao BETWEEN :dataInicio AND :dataFim")
    List<ClassificacaoRisco> findByCorPrioridadeAndPeriodo(
            @Param("cor") String cor,
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim);

    @Query("SELECT cr FROM ClassificacaoRisco cr WHERE cr.operador.id = :operadorId AND " +
           "cr.dataClassificacao BETWEEN :dataInicio AND :dataFim")
    Page<ClassificacaoRisco> findByOperadorAndPeriodo(
            @Param("operadorId") Long operadorId,
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim,
            Pageable pageable);

    @Query("SELECT cr FROM ClassificacaoRisco cr WHERE cr.riscoSepse = true AND " +
           "cr.dataClassificacao >= :dataInicio")
    List<ClassificacaoRisco> findPacientesComRiscoSepse(@Param("dataInicio") LocalDateTime dataInicio);

    List<ClassificacaoRisco> findByReavaliacao(boolean reavaliacao);

    @Query("SELECT cr FROM ClassificacaoRisco cr WHERE cr.encaminhamentoSocial = true AND " +
           "cr.dataClassificacao BETWEEN :dataInicio AND :dataFim")
    List<ClassificacaoRisco> findEncaminhamentosSociais(
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim);

    @Query("SELECT COUNT(cr) FROM ClassificacaoRisco cr WHERE cr.protocoloUtilizado = :protocolo AND " +
           "cr.dataClassificacao BETWEEN :dataInicio AND :dataFim")
    Long countByProtocoloAndPeriodo(
            @Param("protocolo") String protocolo,
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim);

    @Query("SELECT cr.corPrioridade, COUNT(cr) FROM ClassificacaoRisco cr WHERE " +
           "cr.dataClassificacao BETWEEN :dataInicio AND :dataFim GROUP BY cr.corPrioridade")
    List<Object[]> getEstatisticasPorCor(
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim);
}