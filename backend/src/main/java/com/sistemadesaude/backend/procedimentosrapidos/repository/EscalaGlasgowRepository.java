package com.sistemadesaude.backend.procedimentosrapidos.repository;

import com.sistemadesaude.backend.procedimentosrapidos.entity.EscalaGlasgow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository para Escala de Glasgow (Nível de Consciência)
 */
@Repository
public interface EscalaGlasgowRepository extends JpaRepository<EscalaGlasgow, Long> {

    /**
     * Busca todas as avaliações de um paciente ordenadas por data decrescente
     */
    List<EscalaGlasgow> findByPacienteIdOrderByDataAvaliacaoDesc(Long pacienteId);

    /**
     * Busca a última avaliação de um paciente
     */
    Optional<EscalaGlasgow> findFirstByPacienteIdOrderByDataAvaliacaoDesc(Long pacienteId);

    /**
     * Busca avaliações por classificação de nível de consciência
     */
    List<EscalaGlasgow> findByClassificacaoNivelConscienciaOrderByDataAvaliacaoDesc(String classificacao);

    /**
     * Busca avaliações realizadas por um avaliador
     */
    List<EscalaGlasgow> findByAvaliadorIdOrderByDataAvaliacaoDesc(Long avaliadorId);

    /**
     * Busca avaliações em um período específico
     */
    @Query("SELECT g FROM EscalaGlasgow g WHERE g.paciente.id = :pacienteId " +
           "AND g.dataAvaliacao BETWEEN :dataInicio AND :dataFim " +
           "ORDER BY g.dataAvaliacao DESC")
    List<EscalaGlasgow> findByPacienteIdAndPeriodo(
            @Param("pacienteId") Long pacienteId,
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim
    );

    /**
     * Busca pacientes com Glasgow grave (≤8 pontos)
     */
    @Query("SELECT g FROM EscalaGlasgow g WHERE g.pontuacaoTotal <= 8 " +
           "ORDER BY g.pontuacaoTotal ASC, g.dataAvaliacao DESC")
    List<EscalaGlasgow> findPacientesComGlasgowGrave();

    /**
     * Verifica se houve piora no nível de consciência
     */
    @Query("SELECT g FROM EscalaGlasgow g WHERE g.paciente.id = :pacienteId " +
           "ORDER BY g.dataAvaliacao DESC LIMIT 2")
    List<EscalaGlasgow> findUltimasDuasAvaliacoes(@Param("pacienteId") Long pacienteId);
}