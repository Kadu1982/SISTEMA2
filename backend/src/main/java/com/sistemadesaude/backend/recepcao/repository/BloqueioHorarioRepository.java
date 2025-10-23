package com.sistemadesaude.backend.recepcao.repository;

import com.sistemadesaude.backend.recepcao.entity.BloqueioHorario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BloqueioHorarioRepository extends JpaRepository<BloqueioHorario, Long> {

    List<BloqueioHorario> findByUnidadeIdAndAtivoTrue(Long unidadeId);

    List<BloqueioHorario> findByProfissionalIdAndAtivoTrue(Long profissionalId);

    @Query("SELECT b FROM BloqueioHorario b WHERE b.unidadeId = :unidadeId " +
           "AND b.ativo = true " +
           "AND b.dataInicio <= :data " +
           "AND (b.dataFim IS NULL OR b.dataFim >= :data)")
    List<BloqueioHorario> findBloqueiosAtivos(
        @Param("unidadeId") Long unidadeId,
        @Param("data") LocalDate data
    );

    @Query("SELECT b FROM BloqueioHorario b WHERE b.profissionalId = :profissionalId " +
           "AND b.ativo = true " +
           "AND b.dataInicio <= :data " +
           "AND (b.dataFim IS NULL OR b.dataFim >= :data)")
    List<BloqueioHorario> findBloqueiosProfissional(
        @Param("profissionalId") Long profissionalId,
        @Param("data") LocalDate data
    );

    @Query("SELECT b FROM BloqueioHorario b WHERE b.unidadeId = :unidadeId " +
           "AND b.ativo = true " +
           "AND ((b.dataInicio BETWEEN :inicio AND :fim) " +
           "OR (b.dataFim BETWEEN :inicio AND :fim) " +
           "OR (b.dataInicio <= :inicio AND (b.dataFim IS NULL OR b.dataFim >= :fim)))")
    List<BloqueioHorario> findBloqueiosNoPeriodo(
        @Param("unidadeId") Long unidadeId,
        @Param("inicio") LocalDate inicio,
        @Param("fim") LocalDate fim
    );
}