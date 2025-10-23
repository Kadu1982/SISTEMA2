package com.sistemadesaude.backend.hospitalar.repository;

import com.sistemadesaude.backend.hospitalar.entity.TransferenciaLeito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransferenciaLeitoRepository extends JpaRepository<TransferenciaLeito, Long> {

    // Buscar por internação
    List<TransferenciaLeito> findByInternacaoIdOrderByDataSolicitacaoDesc(Long internacaoId);

    // Buscar por status
    List<TransferenciaLeito> findByStatusTransferenciaOrderByDataSolicitacaoAsc(TransferenciaLeito.StatusTransferencia status);

    // Buscar transferências pendentes
    @Query("SELECT t FROM TransferenciaLeito t WHERE t.statusTransferencia IN :statusList ORDER BY t.dataSolicitacao")
    List<TransferenciaLeito> findTransferenciasPendentes(@Param("statusList") List<TransferenciaLeito.StatusTransferencia> statusList);

    // Buscar por tipo de transferência
    List<TransferenciaLeito> findByTipoTransferenciaAndStatusTransferenciaOrderByDataSolicitacao(
            TransferenciaLeito.TipoTransferencia tipo, TransferenciaLeito.StatusTransferencia status);

    // Buscar por leito origem
    List<TransferenciaLeito> findByLeitoOrigemIdOrderByDataSolicitacaoDesc(Long leitoOrigemId);

    // Buscar por leito destino
    List<TransferenciaLeito> findByLeitoDestinoIdOrderByDataSolicitacaoDesc(Long leitoDestinoId);

    // Buscar por operador solicitação
    List<TransferenciaLeito> findByOperadorSolicitacaoIdOrderByDataSolicitacaoDesc(Long operadorId);

    // Buscar por período de solicitação
    @Query("SELECT t FROM TransferenciaLeito t WHERE t.dataSolicitacao BETWEEN :dataInicio AND :dataFim ORDER BY t.dataSolicitacao DESC")
    List<TransferenciaLeito> findByPeriodoSolicitacao(@Param("dataInicio") LocalDateTime dataInicio, @Param("dataFim") LocalDateTime dataFim);

    // Buscar por período de efetivação
    @Query("SELECT t FROM TransferenciaLeito t WHERE t.dataEfetivacao BETWEEN :dataInicio AND :dataFim ORDER BY t.dataEfetivacao DESC")
    List<TransferenciaLeito> findByPeriodoEfetivacao(@Param("dataInicio") LocalDateTime dataInicio, @Param("dataFim") LocalDateTime dataFim);

    // Estatísticas - Contar por status
    @Query("SELECT t.statusTransferencia, COUNT(t) FROM TransferenciaLeito t GROUP BY t.statusTransferencia")
    List<Object[]> countByStatus();

    // Estatísticas - Contar por tipo
    @Query("SELECT t.tipoTransferencia, COUNT(t) FROM TransferenciaLeito t WHERE t.statusTransferencia = :status GROUP BY t.tipoTransferencia")
    List<Object[]> countByTipo(@Param("status") TransferenciaLeito.StatusTransferencia status);

    // Buscar transferências urgentes (para UTI, isolamento, etc.)
    @Query("SELECT t FROM TransferenciaLeito t WHERE t.tipoTransferencia IN :tiposUrgentes AND t.statusTransferencia = :status ORDER BY t.dataSolicitacao")
    List<TransferenciaLeito> findTransferenciasUrgentes(
            @Param("tiposUrgentes") List<TransferenciaLeito.TipoTransferencia> tiposUrgentes,
            @Param("status") TransferenciaLeito.StatusTransferencia status);

    // Tempo médio de autorização (simplificado)
    @Query("SELECT COUNT(t) FROM TransferenciaLeito t WHERE t.dataAutorizacao IS NOT NULL")
    Long countTransferenciasAutorizadas();

    // Tempo médio de efetivação (simplificado)
    @Query("SELECT COUNT(t) FROM TransferenciaLeito t WHERE t.dataEfetivacao IS NOT NULL AND t.dataAutorizacao IS NOT NULL")
    Long countTransferenciasEfetivadas();
}