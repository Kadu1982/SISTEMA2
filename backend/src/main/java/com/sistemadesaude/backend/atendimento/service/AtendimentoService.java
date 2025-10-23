package com.sistemadesaude.backend.atendimento.service;

import com.sistemadesaude.backend.atendimento.dto.AtendimentoDTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 🏥 INTERFACE DO SERVIÇO DE ATENDIMENTO
 *
 * ✅ CORRIGIDO: Alinhamento com implementação (Long IDs)
 * ✅ ATUALIZADO: Métodos compatíveis com AtendimentoServiceImpl
 * ✅ CONSISTÊNCIA: Todos os parâmetros de ID agora são Long
 */
public interface AtendimentoService {

    // ========================================
    // 💾 OPERAÇÕES BÁSICAS CRUD
    // ========================================

    /**
     * Cria um novo atendimento
     */
    AtendimentoDTO criarAtendimento(AtendimentoDTO dto);

    /**
     * Busca atendimento por ID (Long)
     */
    AtendimentoDTO buscarPorId(Long id);

    /**
     * Lista todos os atendimentos ativos
     */
    List<AtendimentoDTO> listarTodos();

    /**
     * Atualiza um atendimento existente (Long ID)
     */
    AtendimentoDTO atualizarAtendimento(Long id, AtendimentoDTO dto);

    /**
     * Exclui (inativa) um atendimento (Long ID)
     */
    void excluirAtendimento(Long id);

    /**
     * Reativa um atendimento (Long ID)
     */
    AtendimentoDTO reativarAtendimento(Long id);

    // ========================================
    // 👤 CONSULTAS POR PACIENTE (Long IDs)
    // ========================================

    /**
     * Busca atendimentos por paciente (Long ID)
     */
    List<AtendimentoDTO> buscarPorPaciente(Long pacienteId);

    /**
     * Busca último atendimento do paciente (Long ID)
     */
    AtendimentoDTO buscarUltimoAtendimentoPaciente(Long pacienteId);

    /**
     * Conta atendimentos de um paciente (Long ID)
     */
    long contarAtendimentosPaciente(Long pacienteId);

    /**
     * Verifica se paciente teve atendimento hoje (Long ID)
     */
    boolean pacienteTevAtendimentoHoje(Long pacienteId);

    // ========================================
    // 🏥 CONSULTAS CLÍNICAS
    // ========================================

    /**
     * Busca atendimentos por CID10
     */
    List<AtendimentoDTO> buscarPorCid10(String cid10);

    /**
     * Busca atendimentos por diagnóstico
     */
    List<AtendimentoDTO> buscarPorDiagnostico(String diagnostico);

    /**
     * Busca por texto livre
     */
    List<AtendimentoDTO> buscarPorTexto(String texto);

    /**
     * Busca atendimentos que precisam de retorno
     */
    List<AtendimentoDTO> buscarAtendimentosComRetorno();

    // ========================================
    // 📅 CONSULTAS POR PERÍODO
    // ========================================

    /**
     * Busca atendimentos em período específico
     */
    List<AtendimentoDTO> buscarPorPeriodo(LocalDateTime inicio, LocalDateTime fim);

    /**
     * Busca atendimentos de hoje
     */
    List<AtendimentoDTO> buscarAtendimentosHoje();

    /**
     * Busca atendimentos da semana atual
     */
    List<AtendimentoDTO> buscarAtendimentosSemanaAtual();

    /**
     * Busca atendimentos do mês atual
     */
    List<AtendimentoDTO> buscarAtendimentosMesAtual();

    // ========================================
    // 👨‍⚕️ CONSULTAS POR PROFISSIONAL (Long IDs)
    // ========================================

    /**
     * Busca atendimentos por profissional (Long ID)
     */
    List<AtendimentoDTO> buscarPorProfissional(Long profissionalId);

    /**
     * Conta atendimentos de profissional em período (Long ID)
     */
    long contarAtendimentosProfissional(Long profissionalId, LocalDateTime inicio, LocalDateTime fim);

    // ========================================
    // 📊 ESTATÍSTICAS E RELATÓRIOS
    // ========================================

    /**
     * Obtém estatísticas básicas
     */
    Map<String, Object> obterEstatisticasBasicas();

    /**
     * Obtém estatísticas de um período
     */
    Map<String, Object> obterEstatisticasPeriodo(LocalDateTime inicio, LocalDateTime fim);

    /**
     * Obtém contagem por CID10 em período
     */
    Map<String, Long> obterContagemPorCid10(LocalDateTime inicio, LocalDateTime fim);

    /**
     * Obtém atendimentos mais recentes
     */
    List<AtendimentoDTO> obterAtendimentosRecentes(int limite);

    // ========================================
    // 🔍 CONSULTAS ESPECIALIZADAS
    // ========================================

    /**
     * Busca por múltiplos CIDs
     */
    List<AtendimentoDTO> buscarPorMultiplosCids(List<String> cids);

    /**
     * Busca por status
     */
    List<AtendimentoDTO> buscarPorStatus(String status);

    /**
     * Verifica se existe atendimento (Long ID)
     */
    boolean existeAtendimento(Long id);
}