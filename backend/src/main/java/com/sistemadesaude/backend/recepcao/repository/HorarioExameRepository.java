package com.sistemadesaude.backend.recepcao.repository;

import com.sistemadesaude.backend.recepcao.entity.HorarioExame;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;

@Repository
public interface HorarioExameRepository extends JpaRepository<HorarioExame, Long> {

    List<HorarioExame> findByUnidadeIdAndAtivoTrue(Long unidadeId);

    List<HorarioExame> findByProfissionalIdAndAtivoTrue(Long profissionalId);

    List<HorarioExame> findBySalaIdAndAtivoTrue(Long salaId);

    List<HorarioExame> findByDiaSemanaAndAtivoTrue(DayOfWeek diaSemana);

    @Query("SELECT h FROM HorarioExame h WHERE h.unidadeId = :unidadeId " +
           "AND h.diaSemana = :diaSemana AND h.ativo = true")
    List<HorarioExame> findByUnidadeAndDiaSemana(
        @Param("unidadeId") Long unidadeId,
        @Param("diaSemana") DayOfWeek diaSemana
    );

    @Query("SELECT h FROM HorarioExame h WHERE h.profissionalId = :profissionalId " +
           "AND h.diaSemana = :diaSemana AND h.ativo = true")
    List<HorarioExame> findByProfissionalAndDiaSemana(
        @Param("profissionalId") Long profissionalId,
        @Param("diaSemana") DayOfWeek diaSemana
    );

    @Query("SELECT h FROM HorarioExame h WHERE h.exameCodigo = :exameCodigo " +
           "AND h.ativo = true")
    List<HorarioExame> findByExameCodigo(@Param("exameCodigo") String exameCodigo);
}