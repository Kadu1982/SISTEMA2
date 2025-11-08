package com.sistemadesaude.backend.procedimentosrapidos.repository;

import com.sistemadesaude.backend.procedimentosrapidos.entity.EscalaMorse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository para Escala de Morse (Risco de Quedas)
 */
@Repository
public interface EscalaMorseRepository extends JpaRepository<EscalaMorse, Long> {

    /**
     * Busca todas as avaliações de um paciente ordenadas por data decrescente
     */
    List<EscalaMorse> findByPacienteIdOrderByDataAvaliacaoDesc(Long pacienteId);

    /**
     * Busca a última avaliação de um paciente
     */
    Optional<EscalaMorse> findFirstByPacienteIdOrderByDataAvaliacaoDesc(Long pacienteId);

    /**
     * Busca avaliações por classificação de risco
     */
    List<EscalaMorse> findByClassificacaoRiscoOrderByDataAvaliacaoDesc(String classificacaoRisco);

    /**
     * Busca avaliações realizadas por um avaliador
     */
    List<EscalaMorse> findByAvaliadorIdOrderByDataAvaliacaoDesc(Long avaliadorId);

    /**
     * Busca avaliações em um período específico
     */
    @Query("SELECT m FROM EscalaMorse m WHERE m.paciente.id = :pacienteId " +
           "AND m.dataAvaliacao BETWEEN :dataInicio AND :dataFim " +
           "ORDER BY m.dataAvaliacao DESC")
    List<EscalaMorse> findByPacienteIdAndPeriodo(
            @Param("pacienteId") Long pacienteId,
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim
    );

    /**
     * Conta avaliações de alto risco por paciente
     */
    @Query("SELECT COUNT(m) FROM EscalaMorse m WHERE m.paciente.id = :pacienteId " +
           "AND m.classificacaoRisco = 'Alto Risco'")
    Long countAltoRiscoByPacienteId(@Param("pacienteId") Long pacienteId);

    /**
     * Busca pacientes com risco elevado (>50 pontos)
     */
    @Query("SELECT m FROM EscalaMorse m WHERE m.pontuacaoTotal > 50 " +
           "ORDER BY m.pontuacaoTotal DESC, m.dataAvaliacao DESC")
    List<EscalaMorse> findPacientesComRiscoElevado();
}