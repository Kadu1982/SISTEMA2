package com.sistemadesaude.backend.procedimentosrapidos.repository;

import com.sistemadesaude.backend.procedimentosrapidos.entity.EscalaBraden;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository para Escala de Braden (Risco de Lesão por Pressão)
 */
@Repository
public interface EscalaBradenRepository extends JpaRepository<EscalaBraden, Long> {

    /**
     * Busca todas as avaliações de um paciente ordenadas por data decrescente
     */
    List<EscalaBraden> findByPacienteIdOrderByDataAvaliacaoDesc(Long pacienteId);

    /**
     * Busca a última avaliação de um paciente
     */
    Optional<EscalaBraden> findFirstByPacienteIdOrderByDataAvaliacaoDesc(Long pacienteId);

    /**
     * Busca avaliações por classificação de risco
     */
    List<EscalaBraden> findByClassificacaoRiscoOrderByDataAvaliacaoDesc(String classificacaoRisco);

    /**
     * Busca avaliações realizadas por um avaliador
     */
    List<EscalaBraden> findByAvaliadorIdOrderByDataAvaliacaoDesc(Long avaliadorId);

    /**
     * Busca avaliações em um período específico
     */
    @Query("SELECT b FROM EscalaBraden b WHERE b.paciente.id = :pacienteId " +
           "AND b.dataAvaliacao BETWEEN :dataInicio AND :dataFim " +
           "ORDER BY b.dataAvaliacao DESC")
    List<EscalaBraden> findByPacienteIdAndPeriodo(
            @Param("pacienteId") Long pacienteId,
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim
    );

    /**
     * Busca pacientes com risco muito alto (≤9 pontos)
     */
    @Query("SELECT b FROM EscalaBraden b WHERE b.pontuacaoTotal <= 9 " +
           "ORDER BY b.pontuacaoTotal ASC, b.dataAvaliacao DESC")
    List<EscalaBraden> findPacientesComRiscoMuitoAlto();

    /**
     * Conta avaliações de risco elevado por paciente
     */
    @Query("SELECT COUNT(b) FROM EscalaBraden b WHERE b.paciente.id = :pacienteId " +
           "AND b.pontuacaoTotal <= 14")
    Long countRiscoElevadoByPacienteId(@Param("pacienteId") Long pacienteId);
}