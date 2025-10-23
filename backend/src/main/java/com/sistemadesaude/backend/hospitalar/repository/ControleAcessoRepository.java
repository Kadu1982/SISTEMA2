package com.sistemadesaude.backend.hospitalar.repository;

import com.sistemadesaude.backend.hospitalar.entity.ControleAcesso;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ControleAcessoRepository extends JpaRepository<ControleAcesso, Long> {

    List<ControleAcesso> findByStatus(String status);

    @Query("SELECT ca FROM ControleAcesso ca WHERE ca.status = 'DENTRO' AND ca.unidade.id = :unidadeId")
    List<ControleAcesso> findPessoasDentroUnidade(@Param("unidadeId") Long unidadeId);

    List<ControleAcesso> findByPacienteId(Long pacienteId);

    List<ControleAcesso> findByTipoVisitante(String tipoVisitante);

    @Query("SELECT ca FROM ControleAcesso ca WHERE ca.documento = :documento AND ca.status = 'DENTRO'")
    Optional<ControleAcesso> findByDocumentoAtivo(@Param("documento") String documento);

    @Query("SELECT ca FROM ControleAcesso ca WHERE ca.dataEntrada BETWEEN :dataInicio AND :dataFim")
    Page<ControleAcesso> findByPeriodoEntrada(
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim,
            Pageable pageable);

    @Query("SELECT ca FROM ControleAcesso ca WHERE ca.unidade.id = :unidadeId AND " +
            "ca.dataEntrada BETWEEN :dataInicio AND :dataFim")
    List<ControleAcesso> findByUnidadeAndPeriodo(
            @Param("unidadeId") Long unidadeId,
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim);

    List<ControleAcesso> findByNumeroCracha(String numeroCracha);

    @Query("SELECT ca FROM ControleAcesso ca WHERE ca.responsavelLiberacao.id = :operadorId AND " +
            "ca.dataEntrada BETWEEN :dataInicio AND :dataFim")
    List<ControleAcesso> findByResponsavelAndPeriodo(
            @Param("operadorId") Long operadorId,
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim);

    @Query("SELECT ca FROM ControleAcesso ca WHERE ca.empresaFornecedor = :empresa AND " +
            "ca.dataEntrada BETWEEN :dataInicio AND :dataFim")
    List<ControleAcesso> findByEmpresaAndPeriodo(
            @Param("empresa") String empresa,
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim);

    @Query("SELECT COUNT(ca) FROM ControleAcesso ca WHERE ca.tipoVisitante = :tipo AND " +
            "ca.dataEntrada BETWEEN :dataInicio AND :dataFim")
    Long countByTipoAndPeriodo(
            @Param("tipo") String tipo,
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim);

    @Query("SELECT ca.tipoVisitante, COUNT(ca) FROM ControleAcesso ca WHERE " +
            "ca.dataEntrada BETWEEN :dataInicio AND :dataFim GROUP BY ca.tipoVisitante")
    List<Object[]> getEstatisticasPorTipo(
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim);

    @Query("SELECT ca FROM ControleAcesso ca WHERE ca.status = 'DENTRO' AND " +
            "ca.dataEntrada < :tempoLimite")
    List<ControleAcesso> findVisitantesComTempoExcedido(@Param("tempoLimite") LocalDateTime tempoLimite);
}