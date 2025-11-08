package com.sistemadesaude.backend.procedimentosrapidos.repository;

import com.sistemadesaude.backend.procedimentosrapidos.entity.EscalaFugulin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository para Escala de Fugulin (Carga de Trabalho)
 */
@Repository
public interface EscalaFugulinRepository extends JpaRepository<EscalaFugulin, Long> {

    /**
     * Busca todas as avaliações de um paciente ordenadas por data decrescente
     */
    List<EscalaFugulin> findByPacienteIdOrderByDataAvaliacaoDesc(Long pacienteId);

    /**
     * Busca a última avaliação de um paciente
     */
    Optional<EscalaFugulin> findFirstByPacienteIdOrderByDataAvaliacaoDesc(Long pacienteId);

    /**
     * Busca avaliações por classificação de cuidado
     */
    List<EscalaFugulin> findByClassificacaoCuidadoOrderByDataAvaliacaoDesc(String classificacaoCuidado);

    /**
     * Busca avaliações realizadas por um avaliador
     */
    List<EscalaFugulin> findByAvaliadorIdOrderByDataAvaliacaoDesc(Long avaliadorId);

    /**
     * Busca avaliações em um período específico
     */
    @Query("SELECT f FROM EscalaFugulin f WHERE f.paciente.id = :pacienteId " +
           "AND f.dataAvaliacao BETWEEN :dataInicio AND :dataFim " +
           "ORDER BY f.dataAvaliacao DESC")
    List<EscalaFugulin> findByPacienteIdAndPeriodo(
            @Param("pacienteId") Long pacienteId,
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim
    );

    /**
     * Busca pacientes com cuidado intensivo ou semi-intensivo
     */
    @Query("SELECT f FROM EscalaFugulin f WHERE f.pontuacaoTotal >= 28 " +
           "ORDER BY f.pontuacaoTotal DESC, f.dataAvaliacao DESC")
    List<EscalaFugulin> findPacientesComCuidadoIntensivo();

    /**
     * Calcula carga de trabalho total por período
     */
    @Query("SELECT SUM(f.pontuacaoTotal) FROM EscalaFugulin f " +
           "WHERE f.dataAvaliacao BETWEEN :dataInicio AND :dataFim")
    Long calcularCargaTotalPorPeriodo(
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim
    );
}