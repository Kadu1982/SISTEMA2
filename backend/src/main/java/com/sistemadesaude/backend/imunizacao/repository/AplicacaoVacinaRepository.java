package com.sistemadesaude.backend.imunizacao.repository;

import com.sistemadesaude.backend.imunizacao.entity.AplicacaoVacina;
import com.sistemadesaude.backend.imunizacao.enums.EstrategiaVacinacao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AplicacaoVacinaRepository extends JpaRepository<AplicacaoVacina, Long> {

    List<AplicacaoVacina> findByPacienteIdOrderByDataAplicacaoDesc(Long pacienteId);

    List<AplicacaoVacina> findByUnidadeIdAndDataAplicacaoBetween(
        Long unidadeId,
        LocalDate dataInicio,
        LocalDate dataFim
    );

    List<AplicacaoVacina> findByVacinaIdAndPacienteIdOrderByDataAplicacaoDesc(
        Long vacinaId,
        Long pacienteId
    );

    // Aplicações pendentes de exportação para RNDS
    @Query("SELECT a FROM AplicacaoVacina a " +
           "JOIN a.vacina v " +
           "JOIN a.unidade u " +
           "JOIN ConfiguracaoImunizacao c ON c.unidade.id = u.id " +
           "WHERE a.exportadoRnds = false " +
           "AND c.exportarRnds = true " +
           "AND c.exportarEsusAb = false " +
           "AND v.calendarioVacinal = true " +
           "AND v.tipoVacina != 'COVID19' " +
           "AND v.exportarSipni = false")
    List<AplicacaoVacina> findPendentesExportacaoRnds();

    // Aplicações pendentes de exportação para e-SUS AB
    @Query("SELECT a FROM AplicacaoVacina a " +
           "JOIN a.unidade u " +
           "JOIN ConfiguracaoImunizacao c ON c.unidade.id = u.id " +
           "WHERE a.exportadoEsus = false " +
           "AND c.exportarEsusAb = true")
    List<AplicacaoVacina> findPendentesExportacaoEsus();

    @Query("SELECT a FROM AplicacaoVacina a " +
           "WHERE (:pacienteId IS NULL OR a.paciente.id = :pacienteId) " +
           "AND (:vacinaId IS NULL OR a.vacina.id = :vacinaId) " +
           "AND (:unidadeId IS NULL OR a.unidade.id = :unidadeId) " +
           "AND (:dataInicio IS NULL OR a.dataAplicacao >= :dataInicio) " +
           "AND (:dataFim IS NULL OR a.dataAplicacao <= :dataFim) " +
           "AND (:estrategia IS NULL OR a.estrategiaVacinacao = :estrategia)")
    Page<AplicacaoVacina> buscarComFiltros(
        @Param("pacienteId") Long pacienteId,
        @Param("vacinaId") Long vacinaId,
        @Param("unidadeId") Long unidadeId,
        @Param("dataInicio") LocalDate dataInicio,
        @Param("dataFim") LocalDate dataFim,
        @Param("estrategia") EstrategiaVacinacao estrategia,
        Pageable pageable
    );

    @Query("SELECT COUNT(a) FROM AplicacaoVacina a WHERE a.dataAplicacao = CURRENT_DATE")
    Long countAplicacoesHoje();

    @Query("SELECT COUNT(a) FROM AplicacaoVacina a WHERE a.dataAplicacao BETWEEN :inicio AND :fim")
    Long countAplicacoesPeriodo(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);
}