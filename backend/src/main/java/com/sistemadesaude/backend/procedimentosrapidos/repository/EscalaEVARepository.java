package com.sistemadesaude.backend.procedimentosrapidos.repository;

import com.sistemadesaude.backend.procedimentosrapidos.entity.EscalaEVA;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository para Escala EVA (Escala Visual Analógica de Dor)
 */
@Repository
public interface EscalaEVARepository extends JpaRepository<EscalaEVA, Long> {

    /**
     * Busca todas as avaliações de um paciente ordenadas por data decrescente
     */
    List<EscalaEVA> findByPacienteIdOrderByDataAvaliacaoDesc(Long pacienteId);

    /**
     * Busca a última avaliação de um paciente
     */
    Optional<EscalaEVA> findFirstByPacienteIdOrderByDataAvaliacaoDesc(Long pacienteId);

    /**
     * Busca avaliações por classificação de dor
     */
    List<EscalaEVA> findByClassificacaoDorOrderByDataAvaliacaoDesc(String classificacaoDor);

    /**
     * Busca avaliações realizadas por um avaliador
     */
    List<EscalaEVA> findByAvaliadorIdOrderByDataAvaliacaoDesc(Long avaliadorId);

    /**
     * Busca avaliações em um período específico
     */
    @Query("SELECT e FROM EscalaEVA e WHERE e.paciente.id = :pacienteId " +
           "AND e.dataAvaliacao BETWEEN :dataInicio AND :dataFim " +
           "ORDER BY e.dataAvaliacao DESC")
    List<EscalaEVA> findByPacienteIdAndPeriodo(
            @Param("pacienteId") Long pacienteId,
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim
    );

    /**
     * Busca pacientes com dor intensa ou insuportável (≥7 pontos)
     */
    @Query("SELECT e FROM EscalaEVA e WHERE e.pontuacaoDor >= 7 " +
           "ORDER BY e.pontuacaoDor DESC, e.dataAvaliacao DESC")
    List<EscalaEVA> findPacientesComDorIntensa();

    /**
     * Calcula média de dor por paciente em um período
     */
    @Query("SELECT AVG(e.pontuacaoDor) FROM EscalaEVA e WHERE e.paciente.id = :pacienteId " +
           "AND e.dataAvaliacao BETWEEN :dataInicio AND :dataFim")
    Double calcularMediaDorPorPeriodo(
            @Param("pacienteId") Long pacienteId,
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim
    );

    /**
     * Busca avaliações por localização da dor
     */
    @Query("SELECT e FROM EscalaEVA e WHERE e.paciente.id = :pacienteId " +
           "AND LOWER(e.localizacaoDor) LIKE LOWER(CONCAT('%', :localizacao, '%')) " +
           "ORDER BY e.dataAvaliacao DESC")
    List<EscalaEVA> findByPacienteIdAndLocalizacao(
            @Param("pacienteId") Long pacienteId,
            @Param("localizacao") String localizacao
    );
}