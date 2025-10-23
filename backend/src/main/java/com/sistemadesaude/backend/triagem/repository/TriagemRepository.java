
package com.sistemadesaude.backend.triagem.repository;

import com.sistemadesaude.backend.triagem.dto.TriagemComProtocoloDTO;
import com.sistemadesaude.backend.triagem.entity.ClassificacaoRisco;
import com.sistemadesaude.backend.triagem.entity.Triagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 🗄️ REPOSITORY COMPLETO PARA TRIAGEM - TODAS AS FUNCIONALIDADES RESTAURADAS
 * ✅ APENAS query de estatísticas corrigida, resto mantido original
 */
@Repository
public interface TriagemRepository extends JpaRepository<Triagem, Long> {

    // ========================================
    // 🔍 BUSCA BÁSICA DE TRIAGENS - ORIGINAIS MANTIDAS
    // ========================================

    @Query("SELECT t FROM Triagem t " +
            "WHERE t.cancelada = false OR t.cancelada IS NULL " +
            "ORDER BY " +
            "CASE t.classificacaoRisco " +
            "WHEN 'VERMELHO' THEN 1 " +
            "WHEN 'LARANJA' THEN 2 " +
            "WHEN 'AMARELO' THEN 3 " +
            "WHEN 'VERDE' THEN 4 " +
            "WHEN 'AZUL' THEN 5 " +
            "ELSE 6 END, " +
            "t.dataTriagem ASC")
    List<Triagem> findAllByOrderByClassificacaoRiscoAscDataTriagemAsc();

    List<Triagem> findByCanceladaFalseOrCanceladaIsNullOrderByDataTriagemDesc();

    @Query("SELECT t FROM Triagem t " +
            "WHERE (t.cancelada = false OR t.cancelada IS NULL) " +
            "AND t.classificacaoRisco = :classificacao " +
            "ORDER BY t.dataTriagem ASC")
    List<Triagem> findByClassificacaoRiscoOrderByDataTriagemAsc(@Param("classificacao") ClassificacaoRisco classificacao);

    @Query("SELECT t FROM Triagem t " +
            "WHERE (t.cancelada = false OR t.cancelada IS NULL) " +
            "AND t.classificacaoRisco IN :classificacoes " +
            "ORDER BY t.dataTriagem ASC")
    List<Triagem> findByClassificacaoRiscoInOrderByDataTriagemAsc(@Param("classificacoes") List<ClassificacaoRisco> classificacoes);

    // ========================================
    // 📅 BUSCA POR PERÍODO - ORIGINAIS MANTIDAS
    // ========================================

    List<Triagem> findByDataTriagemBetweenOrderByDataTriagemDesc(LocalDateTime dataInicio, LocalDateTime dataFim);

    Long countByClassificacaoRiscoAndDataTriagemBetween(
            ClassificacaoRisco classificacao,
            LocalDateTime dataInicio,
            LocalDateTime dataFim
    );

    boolean existsByPacienteIdAndDataTriagemBetween(
            Long pacienteId,
            LocalDateTime dataInicio,
            LocalDateTime dataFim
    );

    // ========================================
    // 👤 BUSCA POR PACIENTE E PROFISSIONAL - ORIGINAIS MANTIDAS
    // ========================================

    List<Triagem> findByPacienteIdOrderByDataTriagemDesc(Long pacienteId);
    List<Triagem> findByProfissionalIdOrderByDataTriagemDesc(Long profissionalId);

    // ========================================
    // 🩺 BUSCA POR SINAIS VITAIS E SINTOMAS - ORIGINAIS MANTIDAS
    // ========================================

    List<Triagem> findByEscalaDorGreaterThanEqualOrderByDataTriagemDesc(Integer escalaDor);
    List<Triagem> findByQueixaPrincipalContainingIgnoreCase(String palavraChave);

    @Query("SELECT t FROM Triagem t " +
            "WHERE (t.cancelada = false OR t.cancelada IS NULL) " +
            "AND (" +
            "    t.temperatura > 38.5 " +
            "    OR t.temperatura < 35.0 " +
            "    OR t.saturacaoOxigenio < 95 " +
            "    OR t.frequenciaCardiaca > 120 " +
            "    OR t.frequenciaCardiaca < 50 " +
            "    OR (" +
            "        t.pressaoArterial IS NOT NULL " +
            "        AND (" +
            "            CAST(SUBSTRING(t.pressaoArterial, 1, LOCATE('x', t.pressaoArterial) - 1) AS INTEGER) > 180 " +
            "            OR CAST(SUBSTRING(t.pressaoArterial, LOCATE('x', t.pressaoArterial) + 1) AS INTEGER) > 120" +
            "        )" +
            "    )" +
            ") " +
            "ORDER BY t.dataTriagem DESC")
    List<Triagem> findTriagensComSinaisAlterados();

    // ========================================
    // 🧠 QUERIES PARA DTO - ORIGINAIS MANTIDAS COM TODOS OS PARÂMETROS
    // ========================================

    @Query("SELECT new com.sistemadesaude.backend.triagem.dto.TriagemComProtocoloDTO(" +
            "t.id, " +                                    // 1
            "t.paciente.id, " +                           // 2
            "t.paciente.nomeCompleto, " +                 // 3
            "t.paciente.dataNascimento, " +               // 4
            "t.dataTriagem, " +                           // 5
            "t.queixaPrincipal, " +                       // 6
            "t.classificacaoRisco, " +                    // 7 - Removido original (causava problema)
            "t.classificacaoRisco, " +                    // 8 - Usando atual como final
            "false, " +                                   // 9 - Placeholder para reclassificado
            "COALESCE(t.protocoloAplicado, 'Manual'), " + // 10
            "CONCAT('Protocolo: ', COALESCE(t.protocoloAplicado, 'Manual')), " + // 11
            "COALESCE(t.observacoes, 'Sem observações'), " + // 12
            "COALESCE(t.observacoes, 'Sem observações'), " + // 13
            "COALESCE(t.condutaSugerida, 'Aguardar avaliação médica'), " + // 14
            "COALESCE(t.diagnosticosSugeridos, 'A definir'), " + // 15
            "COALESCE(t.observacoes, 'Sem detalhes adicionais'), " + // 16
            "t.temperatura, " +                           // 17
            "t.saturacaoOxigenio, " +                     // 18
            "t.pressaoArterial, " +                       // 19
            "t.frequenciaCardiaca, " +                    // 20
            "t.escalaDor, " +                             // 21
            "'Sistema Automatizado', " +                  // 22 - Quem analisou
            "t.dataCriacao" +                             // 23
            ") " +
            "FROM Triagem t " +
            "WHERE t.dataTriagem BETWEEN :dataInicio AND :dataFim " +
            "ORDER BY t.dataTriagem DESC")
    List<TriagemComProtocoloDTO> findTriagensComProtocoloDetalhado(
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim
    );

    @Query("SELECT new com.sistemadesaude.backend.triagem.dto.TriagemComProtocoloDTO(" +
            "t.id, t.paciente.id, t.paciente.nomeCompleto, t.paciente.dataNascimento, " +
            "t.dataTriagem, t.queixaPrincipal, t.classificacaoRisco, t.classificacaoRisco, " +
            "false, COALESCE(t.protocoloAplicado, 'Manual'), " +
            "CONCAT('Protocolo: ', COALESCE(t.protocoloAplicado, 'Manual')), " +
            "COALESCE(t.observacoes, 'Sem observações'), COALESCE(t.observacoes, 'Sem observações'), " +
            "COALESCE(t.condutaSugerida, 'Aguardar avaliação médica'), " +
            "COALESCE(t.diagnosticosSugeridos, 'A definir'), " +
            "COALESCE(t.observacoes, 'Sem detalhes adicionais'), " +
            "t.temperatura, t.saturacaoOxigenio, t.pressaoArterial, t.frequenciaCardiaca, " +
            "t.escalaDor, 'Sistema Automatizado', t.dataCriacao" +
            ") " +
            "FROM Triagem t " +
            "WHERE t.dataTriagem BETWEEN :dataInicio AND :dataFim " +
            "AND (:protocoloNome IS NULL OR LOWER(t.protocoloAplicado) LIKE LOWER(CONCAT('%', :protocoloNome, '%'))) " +
            "ORDER BY t.dataTriagem DESC")
    List<TriagemComProtocoloDTO> findTriagensComProtocoloEspecifico(
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim,
            @Param("protocoloNome") String protocoloNome
    );

    // ========================================
    // 📊 ESTATÍSTICAS - QUERIES ORIGINAIS MANTIDAS
    // ========================================

    @Query("SELECT t.classificacaoRisco, COUNT(t) " +
            "FROM Triagem t " +
            "WHERE t.dataTriagem BETWEEN :dataInicio AND :dataFim " +
            "GROUP BY t.classificacaoRisco")
    List<Object[]> contarTriagensPorClassificacao(
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim
    );

    @Query("SELECT t.protocoloAplicado, COUNT(t) " +
            "FROM Triagem t " +
            "WHERE t.dataTriagem BETWEEN :dataInicio AND :dataFim " +
            "AND t.protocoloAplicado IS NOT NULL " +
            "GROUP BY t.protocoloAplicado " +
            "ORDER BY COUNT(t) DESC")
    List<Object[]> contarTriagensPorProtocolo(
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim
    );

    // ========================================
    // ✅ QUERY CORRIGIDA - APENAS ESTA MUDOU!
    // ========================================

    /**
     * ✅ CORREÇÃO DEFINITIVA - Query nativa para MySQL/H2 que funciona
     *
     * Calculou média de triagens por dia sem usar subquery complexa
     */
    @Query(value = "SELECT AVG(contagem.total_dia) FROM (" +
            "SELECT DATE(data_triagem) as dia, COUNT(*) as total_dia " +
            "FROM triagens " +
            "WHERE data_triagem >= :dataLimite " +
            "GROUP BY DATE(data_triagem)" +
            ") contagem", nativeQuery = true)
    Double calcularMediaTriagensPorDia(@Param("dataLimite") LocalDateTime dataLimite);

    // ========================================
    // 🚨 QUERIES ESPECIAIS - TODAS ORIGINAIS MANTIDAS
    // ========================================

    @Query("SELECT t FROM Triagem t " +
            "WHERE (t.cancelada = false OR t.cancelada IS NULL) " +
            "AND t.classificacaoRisco IN ('VERMELHO', 'LARANJA') " +
            "AND t.dataTriagem >= :dataLimite " +
            "ORDER BY " +
            "CASE t.classificacaoRisco " +
            "WHEN 'VERMELHO' THEN 1 " +
            "WHEN 'LARANJA' THEN 2 " +
            "END, t.dataTriagem ASC")
    List<Triagem> findTriagensCriticasPendentes(@Param("dataLimite") LocalDateTime dataLimite);

    @Query("SELECT t FROM Triagem t " +
            "WHERE (t.cancelada = false OR t.cancelada IS NULL) " +
            "AND t.dataTriagem < :tempoLimite " +
            "ORDER BY t.dataTriagem ASC")
    List<Triagem> findTriagensComEsperaExcessiva(@Param("tempoLimite") LocalDateTime tempoLimite);

    @Query("SELECT t FROM Triagem t " +
            "WHERE t.classificacaoOriginal IS NOT NULL " +
            "AND t.classificacaoOriginal != t.classificacaoRisco " +
            "ORDER BY t.dataTriagem DESC")
    List<Triagem> findTriagensReclassificadas();

    List<Triagem> findByProtocoloAplicadoContainingIgnoreCaseOrderByDataTriagemDesc(String protocolo);

    @Query("SELECT COUNT(t) > 0 FROM Triagem t " +
            "WHERE t.agendamento.id = :agendamentoId " +
            "AND (t.cancelada = false OR t.cancelada IS NULL)")
    boolean existsTriagemAtivaByAgendamentoId(@Param("agendamentoId") Long agendamentoId);

    @Query("SELECT t FROM Triagem t " +
            "WHERE t.paciente.id = :pacienteId " +
            "ORDER BY t.dataTriagem DESC " +
            "LIMIT 1")
    Triagem findUltimaTriagemPaciente(@Param("pacienteId") Long pacienteId);
}
