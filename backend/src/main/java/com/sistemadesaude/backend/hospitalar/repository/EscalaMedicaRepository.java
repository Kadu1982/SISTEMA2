package com.sistemadesaude.backend.hospitalar.repository;

import com.sistemadesaude.backend.hospitalar.entity.EscalaMedica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EscalaMedicaRepository extends JpaRepository<EscalaMedica, Long> {

    // Buscar escalas por profissional
    List<EscalaMedica> findByProfissionalIdOrderByDataEscalaDescHoraInicio(Long profissionalId);

    // Buscar escalas por profissional e data
    List<EscalaMedica> findByProfissionalIdAndDataEscalaOrderByHoraInicio(Long profissionalId, LocalDate dataEscala);

    // Buscar escalas por unidade e data
    List<EscalaMedica> findByUnidadeIdAndDataEscalaOrderByHoraInicio(Long unidadeId, LocalDate dataEscala);

    // Buscar escalas por especialidade e período
    @Query("SELECT e FROM EscalaMedica e WHERE e.especialidadeId = :especialidadeId " +
           "AND e.dataEscala BETWEEN :dataInicio AND :dataFim " +
           "AND e.statusEscala = 'ATIVA' " +
           "ORDER BY e.dataEscala, e.horaInicio")
    List<EscalaMedica> findByEspecialidadeAndPeriodoAtivas(
            @Param("especialidadeId") Long especialidadeId,
            @Param("dataInicio") LocalDate dataInicio,
            @Param("dataFim") LocalDate dataFim);

    // Buscar escalas ativas para uma data
    @Query("SELECT e FROM EscalaMedica e WHERE e.dataEscala = :data " +
           "AND e.statusEscala = 'ATIVA' " +
           "ORDER BY e.horaInicio")
    List<EscalaMedica> findEscalasAtivasPorData(@Param("data") LocalDate data);

    // Buscar escalas com vagas disponíveis
    @Query("SELECT e FROM EscalaMedica e WHERE e.dataEscala = :data " +
           "AND e.statusEscala = 'ATIVA' " +
           "AND (e.vagasDisponiveis - e.vagasOcupadas - e.vagasBloqueadas) > 0 " +
           "ORDER BY e.horaInicio")
    List<EscalaMedica> findEscalasComVagasDisponiveis(@Param("data") LocalDate data);

    // Buscar escalas por tipo
    List<EscalaMedica> findByTipoEscalaAndDataEscalaBetweenOrderByDataEscala(
            EscalaMedica.TipoEscala tipoEscala,
            LocalDate dataInicio,
            LocalDate dataFim);

    // Verificar conflito de escala para profissional
    @Query("SELECT e FROM EscalaMedica e WHERE e.profissionalId = :profissionalId " +
           "AND e.dataEscala = :data " +
           "AND e.statusEscala IN ('ATIVA', 'SUSPENSA') " +
           "AND ((e.horaInicio <= :horaInicio AND e.horaFim > :horaInicio) " +
           "     OR (e.horaInicio < :horaFim AND e.horaFim >= :horaFim) " +
           "     OR (e.horaInicio >= :horaInicio AND e.horaFim <= :horaFim)) " +
           "AND (:id IS NULL OR e.id != :id)")
    List<EscalaMedica> findConflitosEscala(
            @Param("profissionalId") Long profissionalId,
            @Param("data") LocalDate data,
            @Param("horaInicio") java.time.LocalTime horaInicio,
            @Param("horaFim") java.time.LocalTime horaFim,
            @Param("id") Long id);

    // Buscar escalas por status
    List<EscalaMedica> findByStatusEscalaAndDataEscalaBetweenOrderByDataEscala(
            EscalaMedica.StatusEscala status,
            LocalDate dataInicio,
            LocalDate dataFim);

    // Contar escalas por profissional em período
    @Query("SELECT COUNT(e) FROM EscalaMedica e WHERE e.profissionalId = :profissionalId " +
           "AND e.dataEscala BETWEEN :dataInicio AND :dataFim " +
           "AND e.statusEscala = 'ATIVA'")
    Long countEscalasAtivasByProfissionalAndPeriodo(
            @Param("profissionalId") Long profissionalId,
            @Param("dataInicio") LocalDate dataInicio,
            @Param("dataFim") LocalDate dataFim);

    // Buscar escalas que permitem encaixe
    @Query("SELECT e FROM EscalaMedica e WHERE e.dataEscala = :data " +
           "AND e.statusEscala = 'ATIVA' " +
           "AND e.permiteEncaixe = true " +
           "AND e.vagasEncaixe > 0 " +
           "ORDER BY e.horaInicio")
    List<EscalaMedica> findEscalasPermitemEncaixe(@Param("data") LocalDate data);

    // Buscar próximas escalas do profissional
    @Query("SELECT e FROM EscalaMedica e WHERE e.profissionalId = :profissionalId " +
           "AND e.dataEscala >= :dataAtual " +
           "AND e.statusEscala IN ('ATIVA', 'SUSPENSA') " +
           "ORDER BY e.dataEscala, e.horaInicio")
    List<EscalaMedica> findProximasEscalas(
            @Param("profissionalId") Long profissionalId,
            @Param("dataAtual") LocalDate dataAtual);

    // Estatísticas de escalas por período
    @Query("SELECT e.statusEscala, COUNT(e) FROM EscalaMedica e " +
           "WHERE e.dataEscala BETWEEN :dataInicio AND :dataFim " +
           "GROUP BY e.statusEscala")
    List<Object[]> countByStatusAndPeriodo(
            @Param("dataInicio") LocalDate dataInicio,
            @Param("dataFim") LocalDate dataFim);

    // Buscar escalas por unidade e especialidade
    @Query("SELECT e FROM EscalaMedica e WHERE e.unidadeId = :unidadeId " +
           "AND e.especialidadeId = :especialidadeId " +
           "AND e.dataEscala BETWEEN :dataInicio AND :dataFim " +
           "AND e.statusEscala = 'ATIVA' " +
           "ORDER BY e.dataEscala, e.horaInicio")
    List<EscalaMedica> findByUnidadeAndEspecialidadeAndPeriodo(
            @Param("unidadeId") Long unidadeId,
            @Param("especialidadeId") Long especialidadeId,
            @Param("dataInicio") LocalDate dataInicio,
            @Param("dataFim") LocalDate dataFim);
}