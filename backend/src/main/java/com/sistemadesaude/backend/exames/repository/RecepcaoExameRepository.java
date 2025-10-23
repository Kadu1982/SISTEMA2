package com.sistemadesaude.backend.exames.repository;

import com.sistemadesaude.backend.exames.entity.RecepcaoExame;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RecepcaoExameRepository extends JpaRepository<RecepcaoExame, Long> {

    Optional<RecepcaoExame> findByNumeroRecepcao(String numeroRecepcao);

    Optional<RecepcaoExame> findByCodigoBarras(String codigoBarras);

    List<RecepcaoExame> findByPacienteIdOrderByDataRecepcaoDesc(Long pacienteId);

    List<RecepcaoExame> findByUnidadeIdAndDataRecepcaoBetween(
        Long unidadeId,
        LocalDateTime dataInicio,
        LocalDateTime dataFim
    );

    @Query("SELECT r FROM RecepcaoExame r WHERE r.status = :status AND (:unidadeId IS NULL OR r.unidade.id = :unidadeId)")
    List<RecepcaoExame> findByStatusAndUnidade(
        @Param("status") RecepcaoExame.StatusRecepcao status,
        @Param("unidadeId") Long unidadeId
    );

    List<RecepcaoExame> findByStatus(RecepcaoExame.StatusRecepcao status);

    @Query("SELECT r FROM RecepcaoExame r WHERE r.agendamentoId = :agendamentoId")
    Optional<RecepcaoExame> findByAgendamentoId(@Param("agendamentoId") Long agendamentoId);

    List<RecepcaoExame> findByUrgenteTrue();
}