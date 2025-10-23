package com.sistemadesaude.backend.exames.repository;

import com.sistemadesaude.backend.exames.entity.ResultadoExame;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ResultadoExameRepository extends JpaRepository<ResultadoExame, Long> {

    Optional<ResultadoExame> findByExameRecepcaoId(Long exameRecepcaoId);

    @Query("SELECT r FROM ResultadoExame r WHERE r.exameRecepcao.recepcao.id = :recepcaoId")
    List<ResultadoExame> findByRecepcaoId(@Param("recepcaoId") Long recepcaoId);

    @Query("SELECT r FROM ResultadoExame r WHERE r.laudoLiberado = true AND r.assinado = false")
    List<ResultadoExame> findResultadosPendentesAssinatura();

    @Query("SELECT r FROM ResultadoExame r WHERE r.laudoLiberado = false")
    List<ResultadoExame> findResultadosNaoLiberados();

    @Query("SELECT r FROM ResultadoExame r WHERE r.dataResultado BETWEEN :dataInicio AND :dataFim")
    List<ResultadoExame> findByPeriodo(
        @Param("dataInicio") LocalDateTime dataInicio,
        @Param("dataFim") LocalDateTime dataFim
    );

    @Query("""
        SELECT r FROM ResultadoExame r
        JOIN r.exameRecepcao er
        JOIN er.recepcao rec
        WHERE er.status = com.sistemadesaude.backend.exames.entity.ExameRecepcao$StatusExameRecepcao.COLETADO
        AND r.resultadoTexto IS NULL
        ORDER BY rec.dataRecepcao ASC
    """)
    List<ResultadoExame> findResultadosPendentesDigitacao();

    @Query("""
        SELECT r FROM ResultadoExame r
        JOIN r.exameRecepcao er
        JOIN er.recepcao rec
        WHERE er.status = com.sistemadesaude.backend.exames.entity.ExameRecepcao$StatusExameRecepcao.COLETADO
        AND r.resultadoTexto IS NULL
        AND rec.unidade.id = :unidadeId
        ORDER BY rec.dataRecepcao ASC
    """)
    List<ResultadoExame> findResultadosPendentesDigitacaoPorUnidade(@Param("unidadeId") Long unidadeId);
}