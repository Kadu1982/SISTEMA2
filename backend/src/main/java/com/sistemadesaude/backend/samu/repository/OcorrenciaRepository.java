package com.sistemadesaude.backend.samu.repository;

import com.sistemadesaude.backend.samu.entity.Ocorrencia;
import com.sistemadesaude.backend.samu.enums.StatusOcorrencia;
import com.sistemadesaude.backend.samu.enums.PrioridadeOcorrencia;
import com.sistemadesaude.backend.samu.enums.RiscoPresumido;
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
public interface OcorrenciaRepository extends JpaRepository<Ocorrencia, Long> {

    // ========================================
    // 🔍 BUSCAS BÁSICAS EXISTENTES
    // ========================================

    @Query("SELECT COUNT(o) FROM Ocorrencia o WHERE o.status = :status")
    Long countByStatus(@Param("status") StatusOcorrencia status);

    // ========================================
    // 🚑 QUERIES PARA REGULAÇÃO MÉDICA
    // ========================================

    @Query("SELECT o FROM Ocorrencia o WHERE o.status IN :statuses ORDER BY o.prioridade ASC, o.dataAbertura ASC")
    Page<Ocorrencia> findByStatusInOrderByPrioridadeAscDataAberturaAsc(
            @Param("statuses") List<StatusOcorrencia> statuses, Pageable pageable);

    @Query("SELECT o FROM Ocorrencia o WHERE o.status IN :statuses AND o.centralRegulacao.id = :centralId ORDER BY o.prioridade ASC, o.dataAbertura ASC")
    Page<Ocorrencia> findByStatusInAndCentralRegulacaoIdOrderByPrioridadeAscDataAberturaAsc(
            @Param("statuses") List<StatusOcorrencia> statuses,
            @Param("centralId") Long centralId,
            Pageable pageable);

    // ========================================
    // 📊 BUSCAS POR PRIORIDADE
    // ========================================

    List<Ocorrencia> findByPrioridade(PrioridadeOcorrencia prioridade);

    List<Ocorrencia> findByPrioridadeIn(List<PrioridadeOcorrencia> prioridades);

    @Query("SELECT o FROM Ocorrencia o WHERE o.prioridade = :prioridade AND o.status NOT IN ('FINALIZADA', 'CANCELADA') ORDER BY o.dataAbertura ASC")
    List<Ocorrencia> findByPrioridadeAtivaOrderByDataAbertura(@Param("prioridade") PrioridadeOcorrencia prioridade);

    // ========================================
    // 🔥 BUSCAS POR RISCO PRESUMIDO
    // ========================================

    @Query("SELECT o FROM Ocorrencia o JOIN o.pacientes p WHERE p.riscoPresumido = :risco AND o.status NOT IN ('FINALIZADA', 'CANCELADA') ORDER BY o.dataAbertura ASC")
    List<Ocorrencia> findByPacientesRiscoPresumidoOrderByDataAberturaAsc(@Param("risco") RiscoPresumido risco);

    @Query("SELECT o FROM Ocorrencia o JOIN o.pacientes p WHERE p.riscoPresumido IN :riscos AND o.status NOT IN ('FINALIZADA', 'CANCELADA') ORDER BY p.riscoPresumido ASC, o.dataAbertura ASC")
    List<Ocorrencia> findByPacientesRiscoPresumidoInOrderByRiscoAscDataAberturaAsc(@Param("riscos") List<RiscoPresumido> riscos);

    // ========================================
    // 📈 ESTATÍSTICAS E CONTADORES
    // ========================================

    Long countByStatusAndDataAberturaBetween(StatusOcorrencia status, LocalDateTime inicio, LocalDateTime fim);

    Long countByPrioridadeAndDataAberturaBetween(PrioridadeOcorrencia prioridade, LocalDateTime inicio, LocalDateTime fim);

    Long countByDataAberturaBetween(LocalDateTime inicio, LocalDateTime fim);

    @Query("SELECT COUNT(o) FROM Ocorrencia o WHERE o.centralRegulacao.id = :centralId AND o.dataAbertura BETWEEN :inicio AND :fim")
    Long countByCentralRegulacaoAndPeriodo(@Param("centralId") Long centralId,
                                           @Param("inicio") LocalDateTime inicio,
                                           @Param("fim") LocalDateTime fim);

    // ========================================
    // ⏱️ BUSCAS POR TEMPO E PERÍODO
    // ========================================

    @Query("SELECT o FROM Ocorrencia o WHERE o.dataAbertura BETWEEN :inicio AND :fim ORDER BY o.dataAbertura DESC")
    List<Ocorrencia> findByDataAberturaBetweenOrderByDataAberturaDesc(
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim);

    @Query("SELECT o FROM Ocorrencia o WHERE o.status IN :statuses AND o.dataAbertura < :tempoLimite ORDER BY o.dataAbertura ASC")
    List<Ocorrencia> findOcorrenciasEmAtraso(@Param("statuses") List<StatusOcorrencia> statuses,
                                             @Param("tempoLimite") LocalDateTime tempoLimite);

    // ========================================
    // 🏥 BUSCAS POR CENTRAL E OPERADOR
    // ========================================

    @Query("SELECT o FROM Ocorrencia o WHERE o.centralRegulacao.id = :centralId AND o.status IN :statuses ORDER BY o.prioridade ASC, o.dataAbertura ASC")
    Page<Ocorrencia> findByCentralRegulacaoAndStatusInOrderByPrioridadeAscDataAberturaAsc(
            @Param("centralId") Long centralId,
            @Param("statuses") List<StatusOcorrencia> statuses,
            Pageable pageable);

    @Query("SELECT o FROM Ocorrencia o WHERE o.medicoRegulador IS NULL AND o.status = 'AGUARDANDO_REGULACAO' ORDER BY o.prioridade ASC, o.dataAbertura ASC")
    List<Ocorrencia> findOcorrenciasSemMedicoRegulador();

    @Query("SELECT o FROM Ocorrencia o WHERE o.medicoRegulador.id = :medicoId AND o.status = 'EM_REGULACAO' ORDER BY o.dataAbertura ASC")
    List<Ocorrencia> findOcorrenciasEmRegulacaoPorMedico(@Param("medicoId") Long medicoId);

    // ========================================
    // 🔍 BUSCAS ESPECIALIZADAS
    // ========================================

    @Query("SELECT o FROM Ocorrencia o WHERE o.numeroOcorrencia = :numero")
    Optional<Ocorrencia> findByNumeroOcorrencia(@Param("numero") String numeroOcorrencia);

    @Query("SELECT o FROM Ocorrencia o WHERE LOWER(o.descricaoOcorrencia) LIKE LOWER(CONCAT('%', :termo, '%')) OR LOWER(o.enderecoCompleto) LIKE LOWER(CONCAT('%', :termo, '%'))")
    List<Ocorrencia> findByDescricaoOrEnderecoContaining(@Param("termo") String termo);

    @Query("SELECT o FROM Ocorrencia o WHERE o.telefoneSolicitante = :telefone ORDER BY o.dataAbertura DESC")
    List<Ocorrencia> findByTelefoneSolicitanteOrderByDataAberturaDesc(@Param("telefone") String telefone);

    // ========================================
    // 📍 BUSCAS GEOGRÁFICAS
    // ========================================

    @Query(value = "SELECT * FROM samu_ocorrencia o WHERE " +
            "ST_DWithin(ST_MakePoint(o.longitude, o.latitude)::geography, " +
            "ST_MakePoint(:longitude, :latitude)::geography, :raioMetros) " +
            "AND o.status NOT IN ('FINALIZADA', 'CANCELADA') " +
            "ORDER BY ST_Distance(ST_MakePoint(o.longitude, o.latitude)::geography, " +
            "ST_MakePoint(:longitude, :latitude)::geography)",
            nativeQuery = true)
    List<Ocorrencia> findOcorrenciasProximas(@Param("latitude") Double latitude,
                                             @Param("longitude") Double longitude,
                                             @Param("raioMetros") Double raioMetros);

    // ========================================
    // 📊 QUERIES PARA DASHBOARD E RELATÓRIOS
    // ========================================

    @Query("SELECT o.status, COUNT(o) FROM Ocorrencia o WHERE o.dataAbertura BETWEEN :inicio AND :fim GROUP BY o.status")
    List<Object[]> contarOcorrenciasPorStatus(@Param("inicio") LocalDateTime inicio,
                                              @Param("fim") LocalDateTime fim);

    @Query("SELECT o.prioridade, COUNT(o) FROM Ocorrencia o WHERE o.dataAbertura BETWEEN :inicio AND :fim GROUP BY o.prioridade")
    List<Object[]> contarOcorrenciasPorPrioridade(@Param("inicio") LocalDateTime inicio,
                                                  @Param("fim") LocalDateTime fim);

    @Query("SELECT cr.nome, COUNT(o) FROM Ocorrencia o JOIN o.centralRegulacao cr WHERE o.dataAbertura BETWEEN :inicio AND :fim GROUP BY cr.nome")
    List<Object[]> contarOcorrenciasPorCentral(@Param("inicio") LocalDateTime inicio,
                                               @Param("fim") LocalDateTime fim);

    // ========================================
    // ⚡ QUERIES DE PERFORMANCE - CORRIGIDAS
    // ========================================

    /**
     * 🕐 CALCULA TEMPO MÉDIO DE ATENDIMENTO EM MINUTOS
     *
     * ✅ CORRIGIDO: Usando função PostgreSQL nativa
     */
    @Query(value = "SELECT AVG(EXTRACT(EPOCH FROM (o.data_encerramento - o.data_abertura))/60) " +
            "FROM samu_ocorrencia o " +
            "WHERE o.data_encerramento IS NOT NULL " +
            "AND o.data_abertura BETWEEN :inicio AND :fim",
            nativeQuery = true)
    Double calcularTempoMedioPorPeriodo(@Param("inicio") LocalDateTime inicio,
                                        @Param("fim") LocalDateTime fim);

    /**
     * ⏰ BUSCA OCORRÊNCIAS COM TEMPO EXCEDIDO
     *
     * ✅ CORRIGIDO: Usando função PostgreSQL nativa
     */
    @Query(value = "SELECT * FROM samu_ocorrencia o " +
            "WHERE o.status IN ('AGUARDANDO_REGULACAO', 'EM_REGULACAO') " +
            "AND EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - o.data_abertura))/60 > :minutosLimite " +
            "ORDER BY o.data_abertura ASC",
            nativeQuery = true)
    List<Ocorrencia> findOcorrenciasComTempoExcedido(@Param("minutosLimite") Integer minutosLimite);

    // ========================================
    // 🚨 EMERGÊNCIAS E CASOS CRÍTICOS
    // ========================================

    @Query("SELECT o FROM Ocorrencia o WHERE o.prioridade IN ('EMERGENCIA', 'URGENCIA') AND o.status NOT IN ('FINALIZADA', 'CANCELADA') ORDER BY o.prioridade ASC, o.dataAbertura ASC")
    List<Ocorrencia> findEmergenciasEUrgenciasAtivas();

    @Query("SELECT DISTINCT o FROM Ocorrencia o JOIN o.pacientes p WHERE p.riscoPresumido IN ('CRITICO', 'ALTO') AND o.status NOT IN ('FINALIZADA', 'CANCELADA') ORDER BY p.riscoPresumido ASC, o.dataAbertura ASC")
    List<Ocorrencia> findOcorrenciasCriticas();

    /**
     * 🚨 CONTA OCORRÊNCIAS AGUARDANDO REGULAÇÃO COM ATRASO
     *
     * ✅ CORRIGIDO: Usando função PostgreSQL nativa
     */
    @Query(value = "SELECT COUNT(*) FROM samu_ocorrencia o " +
            "WHERE o.status = 'AGUARDANDO_REGULACAO' " +
            "AND EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - o.data_abertura))/60 > 30",
            nativeQuery = true)
    Long countOcorrenciasAguardandoRegulacaoComAtraso();

    // ========================================
    // 🎯 QUERIES AVANÇADAS PARA ANÁLISE
    // ========================================

    /**
     * 📊 RELATÓRIO DE PERFORMANCE POR PERÍODO
     */
    @Query(value = "SELECT " +
            "DATE(o.data_abertura) as data, " +
            "COUNT(*) as total_ocorrencias, " +
            "AVG(CASE WHEN o.data_encerramento IS NOT NULL " +
            "    THEN EXTRACT(EPOCH FROM (o.data_encerramento - o.data_abertura))/60 " +
            "    ELSE NULL END) as tempo_medio_minutos, " +
            "COUNT(CASE WHEN o.status = 'FINALIZADA' THEN 1 END) as finalizadas, " +
            "COUNT(CASE WHEN o.prioridade IN ('EMERGENCIA', 'URGENCIA') THEN 1 END) as criticas " +
            "FROM samu_ocorrencia o " +
            "WHERE o.data_abertura BETWEEN :inicio AND :fim " +
            "GROUP BY DATE(o.data_abertura) " +
            "ORDER BY data DESC",
            nativeQuery = true)
    List<Object[]> relatorioPerformancePorDia(@Param("inicio") LocalDateTime inicio,
                                              @Param("fim") LocalDateTime fim);

    /**
     * 🎯 TOP 5 ENDEREÇOS COM MAIS OCORRÊNCIAS
     */
    @Query(value = "SELECT " +
            "SUBSTRING(o.endereco_completo, 1, 100) as endereco_resumido, " +
            "COUNT(*) as quantidade, " +
            "AVG(CASE WHEN o.data_encerramento IS NOT NULL " +
            "    THEN EXTRACT(EPOCH FROM (o.data_encerramento - o.data_abertura))/60 " +
            "    ELSE NULL END) as tempo_medio " +
            "FROM samu_ocorrencia o " +
            "WHERE o.data_abertura BETWEEN :inicio AND :fim " +
            "GROUP BY SUBSTRING(o.endereco_completo, 1, 100) " +
            "ORDER BY quantidade DESC " +
            "LIMIT 5",
            nativeQuery = true)
    List<Object[]> topEnderecosComMaisOcorrencias(@Param("inicio") LocalDateTime inicio,
                                                  @Param("fim") LocalDateTime fim);

    /**
     * 📈 EVOLUÇÃO TEMPORAL DE OCORRÊNCIAS POR HORA
     */
    @Query(value = "SELECT " +
            "EXTRACT(HOUR FROM o.data_abertura) as hora, " +
            "COUNT(*) as quantidade, " +
            "COUNT(CASE WHEN o.prioridade IN ('EMERGENCIA', 'URGENCIA') THEN 1 END) as criticas " +
            "FROM samu_ocorrencia o " +
            "WHERE o.data_abertura BETWEEN :inicio AND :fim " +
            "GROUP BY EXTRACT(HOUR FROM o.data_abertura) " +
            "ORDER BY hora",
            nativeQuery = true)
    List<Object[]> distribuicaoOcorrenciasPorHora(@Param("inicio") LocalDateTime inicio,
                                                  @Param("fim") LocalDateTime fim);

    // ========================================
    // 🔍 BUSCAS PARA AUDITORIA E CONTROLE
    // ========================================

    /**
     * 📋 OCORRÊNCIAS SEM ENCERRAMENTO HÁ MAIS DE X HORAS
     */
    @Query(value = "SELECT * FROM samu_ocorrencia o " +
            "WHERE o.data_encerramento IS NULL " +
            "AND o.status NOT IN ('FINALIZADA', 'CANCELADA') " +
            "AND EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - o.data_abertura))/3600 > :horasLimite " +
            "ORDER BY o.data_abertura ASC",
            nativeQuery = true)
    List<Ocorrencia> findOcorrenciasSemEncerramentoAposHoras(@Param("horasLimite") Integer horasLimite);

    /**
     * 🚑 OCORRÊNCIAS POR OPERADOR NO PERÍODO
     */
    @Query("SELECT op.nome, COUNT(o) FROM Ocorrencia o JOIN o.operador op " +
            "WHERE o.dataAbertura BETWEEN :inicio AND :fim " +
            "GROUP BY op.nome " +
            "ORDER BY COUNT(o) DESC")
    List<Object[]> contarOcorrenciasPorOperador(@Param("inicio") LocalDateTime inicio,
                                                @Param("fim") LocalDateTime fim);

    /**
     * 👨‍⚕️ PERFORMANCE DOS MÉDICOS REGULADORES
     *
     * ✅ CORRIGIDO: Substituído TIMESTAMPDIFF por EXTRACT EPOCH PostgreSQL
     */
    @Query(value = "SELECT " +
            "mr.nome, " +
            "COUNT(o.id) as total_ocorrencias, " +
            "AVG(EXTRACT(EPOCH FROM (o.data_encerramento - o.data_abertura))/60) as tempo_medio_minutos " +
            "FROM samu_ocorrencia o " +
            "INNER JOIN operador mr ON o.medico_regulador_id = mr.id " +
            "WHERE o.data_abertura BETWEEN :inicio AND :fim " +
            "AND o.data_encerramento IS NOT NULL " +
            "GROUP BY mr.nome " +
            "ORDER BY total_ocorrencias DESC",
            nativeQuery = true)
    List<Object[]> performanceMedicosReguladores(@Param("inicio") LocalDateTime inicio,
                                                 @Param("fim") LocalDateTime fim);

    // ========================================
    // 🌍 QUERIES GEOESPACIAIS AVANÇADAS
    // ========================================

    /**
     * 📍 DENSIDADE DE OCORRÊNCIAS POR REGIÃO
     */
    @Query(value = "SELECT " +
            "ROUND(o.latitude::numeric, 3) as lat_region, " +
            "ROUND(o.longitude::numeric, 3) as lng_region, " +
            "COUNT(*) as quantidade, " +
            "COUNT(CASE WHEN o.prioridade IN ('EMERGENCIA', 'URGENCIA') THEN 1 END) as criticas " +
            "FROM samu_ocorrencia o " +
            "WHERE o.latitude IS NOT NULL AND o.longitude IS NOT NULL " +
            "AND o.data_abertura BETWEEN :inicio AND :fim " +
            "GROUP BY ROUND(o.latitude::numeric, 3), ROUND(o.longitude::numeric, 3) " +
            "HAVING COUNT(*) >= :minimoOcorrencias " +
            "ORDER BY quantidade DESC",
            nativeQuery = true)
    List<Object[]> densidadeOcorrenciasPorRegiao(@Param("inicio") LocalDateTime inicio,
                                                 @Param("fim") LocalDateTime fim,
                                                 @Param("minimoOcorrencias") Integer minimoOcorrencias);
}
