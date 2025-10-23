package com.sistemadesaude.backend.atendimento.repository;

import com.sistemadesaude.backend.atendimento.entity.Atendimento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 🗃️ REPOSITÓRIO PARA OPERAÇÕES DE DADOS DA ENTIDADE ATENDIMENTO
 *
 * ✅ CORRIGIDO: Tipo do ID alterado para Long (compatível com a entidade)
 * ✅ CORRIGIDO: Queries compatíveis com JPA/JPQL
 * ✅ CORRIGIDO: Métodos duplicados removidos
 * ✅ ATUALIZADO: Queries otimizadas e padronizadas
 * ✅ ATUALIZADO: Método de busca por retorno ajustado para usar 'motivoDesfecho'
 */
@Repository
public interface AtendimentoRepository extends JpaRepository<Atendimento, Long> {

    // ========================================
    // 👤 CONSULTAS POR PACIENTE
    // ========================================

    /**
     * Busca atendimentos por paciente ID ordenados por data (mais recente primeiro)
     */
    List<Atendimento> findByPacienteIdOrderByDataHoraDesc(Long pacienteId);

    /**
     * Busca atendimentos ativos por paciente
     */
    List<Atendimento> findByPacienteIdAndAtivoTrueOrderByDataHoraDesc(Long pacienteId);

    /**
     * Busca último atendimento do paciente
     */
    @Query("SELECT a FROM Atendimento a WHERE a.pacienteId = :pacienteId AND a.ativo = true ORDER BY a.dataHora DESC")
    List<Atendimento> findUltimoAtendimentoPacienteList(@Param("pacienteId") Long pacienteId);

    /**
     * Método utilitário para buscar o último atendimento como Optional
     */
    default Optional<Atendimento> findUltimoAtendimentoPaciente(Long pacienteId) {
        List<Atendimento> atendimentos = findUltimoAtendimentoPacienteList(pacienteId);
        return atendimentos.isEmpty() ? Optional.empty() : Optional.of(atendimentos.get(0));
    }

    /**
     * Conta total de atendimentos do paciente
     */
    long countByPacienteId(Long pacienteId);

    /**
     * Verifica se paciente teve atendimento hoje
     */
    @Query("SELECT COUNT(a) > 0 FROM Atendimento a WHERE a.pacienteId = :pacienteId " +
            "AND a.dataHora >= :inicioHoje AND a.dataHora < :fimHoje AND a.ativo = true")
    boolean existsByPacienteIdAndDataHojeAndAtivoTrue(
            @Param("pacienteId") Long pacienteId,
            @Param("inicioHoje") LocalDateTime inicioHoje,
            @Param("fimHoje") LocalDateTime fimHoje
    );

    // ========================================
    // 👨‍⚕️ CONSULTAS POR PROFISSIONAL
    // ========================================

    /**
     * Busca atendimentos por profissional (Long ID)
     */
    List<Atendimento> findByProfissionalIdAndAtivoTrueOrderByDataHoraDesc(Long profissionalId);

    // ========================================
    // 🏥 CONSULTAS POR CID10 E DIAGNÓSTICO
    // ========================================

    /**
     * Busca atendimentos por CID10
     */
    List<Atendimento> findByCid10OrderByDataHoraDesc(String cid10);

    /**
     * Busca atendimentos ativos por CID10
     */
    List<Atendimento> findByCid10AndAtivoTrueOrderByDataHoraDesc(String cid10);

    /**
     * Busca atendimentos por diagnóstico (contém - case insensitive)
     */
    List<Atendimento> findByDiagnosticoContainingIgnoreCaseOrderByDataHoraDesc(String diagnostico);

    /**
     * Busca atendimentos ativos por diagnóstico
     */
    List<Atendimento> findByDiagnosticoContainingIgnoreCaseAndAtivoTrueOrderByDataHoraDesc(String diagnostico);

    /**
     * Busca por múltiplos CIDs
     */
    @Query("SELECT a FROM Atendimento a WHERE a.cid10 IN :cids AND a.ativo = true ORDER BY a.dataHora DESC")
    List<Atendimento> findByCid10In(@Param("cids") List<String> cids);

    // ========================================
    // 📅 CONSULTAS POR PERÍODO
    // ========================================

    /**
     * Busca atendimentos em um período específico
     */
    @Query("SELECT a FROM Atendimento a WHERE a.dataHora BETWEEN :inicio AND :fim AND a.ativo = true ORDER BY a.dataHora DESC")
    List<Atendimento> findByDataHoraBetween(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    /**
     * Busca atendimentos do dia atual
     */
    @Query("SELECT a FROM Atendimento a WHERE a.dataHora >= :inicioHoje AND a.dataHora < :fimHoje AND a.ativo = true ORDER BY a.dataHora DESC")
    List<Atendimento> findAtendimentosHoje(@Param("inicioHoje") LocalDateTime inicioHoje, @Param("fimHoje") LocalDateTime fimHoje);

    /**
     * Busca atendimentos da semana atual
     */
    @Query("SELECT a FROM Atendimento a WHERE a.dataHora >= :inicioSemana AND a.dataHora < :fimSemana AND a.ativo = true ORDER BY a.dataHora DESC")
    List<Atendimento> findAtendimentosSemana(@Param("inicioSemana") LocalDateTime inicioSemana, @Param("fimSemana") LocalDateTime fimSemana);

    /**
     * Busca atendimentos do mês atual
     */
    @Query("SELECT a FROM Atendimento a WHERE a.dataHora >= :inicioMes AND a.dataHora < :fimMes AND a.ativo = true ORDER BY a.dataHora DESC")
    List<Atendimento> findAtendimentosMes(@Param("inicioMes") LocalDateTime inicioMes, @Param("fimMes") LocalDateTime fimMes);

    // ========================================
    // 🔍 CONSULTAS DE TEXTO
    // ========================================

    /**
     * Busca por texto livre em múltiplos campos
     */
    @Query("SELECT a FROM Atendimento a WHERE " +
            "(LOWER(a.diagnostico) LIKE LOWER(CONCAT('%', :texto, '%')) OR " +
            "LOWER(a.observacoes) LIKE LOWER(CONCAT('%', :texto, '%')) OR " +
            "LOWER(a.sintomas) LIKE LOWER(CONCAT('%', :texto, '%'))) " +
            "AND a.ativo = true ORDER BY a.dataHora DESC")
    List<Atendimento> findByTextoLivre(@Param("texto") String texto);

    /**
     * Busca atendimentos marcados para retorno (motivo de desfecho = 08)
     */
    @Query("SELECT a FROM Atendimento a WHERE a.motivoDesfecho = '08' AND a.ativo = true ORDER BY a.dataHora DESC")
    List<Atendimento> findAtendimentosComRetorno();

    // ========================================
    // 🏥 CONSULTAS POR STATUS E CONTROLE
    // ========================================

    /**
     * Busca atendimentos por status
     */
    List<Atendimento> findByStatusAtendimentoAndAtivoTrueOrderByDataHoraDesc(String status);

    /**
     * Busca todos os atendimentos ativos
     */
    List<Atendimento> findByAtivoTrueOrderByDataHoraDesc();

    // ========================================
    // 📊 CONSULTAS ESTATÍSTICAS
    // ========================================

    /**
     * Conta atendimentos por CID10
     */
    long countByCid10AndAtivoTrue(String cid10);

    /**
     * Conta atendimentos por status
     */
    long countByStatusAtendimentoAndAtivoTrue(String status);

    /**
     * Conta atendimentos em período
     */
    @Query("SELECT COUNT(a) FROM Atendimento a WHERE a.dataHora BETWEEN :inicio AND :fim AND a.ativo = true")
    long countByDataHoraBetween(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    /**
     * Busca CIDs mais comuns
     */
    @Query("SELECT a.cid10, COUNT(a) as total FROM Atendimento a WHERE a.ativo = true GROUP BY a.cid10 ORDER BY total DESC")
    List<Object[]> findCidsComuns();
}