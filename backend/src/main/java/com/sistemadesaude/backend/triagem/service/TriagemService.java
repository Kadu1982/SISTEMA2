package com.sistemadesaude.backend.triagem.service;

import com.sistemadesaude.backend.triagem.dto.*;
import com.sistemadesaude.backend.triagem.entity.ClassificacaoRisco;
import com.sistemadesaude.backend.triagem.entity.Triagem;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 🩺 INTERFACE COMPLETA DO SERVIÇO DE TRIAGEM
 *
 * ✅ ATUALIZADA com suporte para:
 * - Filtros por data específica
 * - Indicadores de calendário
 * - Busca de datas com pacientes recepcionados
 * - Todos os métodos originais mantidos
 *
 * Define todos os métodos necessários para o sistema de triagem
 * inteligente com protocolos do Ministério da Saúde
 */
public interface TriagemService {

    // ========================================
    // 💾 OPERAÇÕES BÁSICAS DE TRIAGEM
    // ========================================

    /**
     * 💾 SALVAR NOVA TRIAGEM COM ANÁLISE INTELIGENTE
     *
     * @param request Dados da triagem a ser criada
     */
    void salvarTriagem(CriarTriagemRequestDTO request);

    /**
     * ❌ CANCELAR TRIAGEM EXISTENTE
     *
     * @param triagemId ID da triagem a ser cancelada
     */
    void cancelarTriagem(Long triagemId);

    // ========================================
    // 📋 BUSCA DE PACIENTES PARA TRIAGEM
    // ========================================

    /**
     * 📋 BUSCAR PACIENTES AGUARDANDO TRIAGEM (TODOS)
     *
     * @return Lista de pacientes aguardando triagem
     */
    List<PacienteAguardandoTriagemDTO> findPacientesAguardandoTriagem();

    /**
     * ✅ NOVO: BUSCAR PACIENTES AGUARDANDO TRIAGEM POR DATA ESPECÍFICA
     *
     * @param dataReferencia Data específica para filtrar os pacientes
     * @return Lista de pacientes aguardando triagem na data especificada
     */
    List<PacienteAguardandoTriagemDTO> findPacientesAguardandoTriagem(LocalDate dataReferencia);

    /**
     * ✅ NOVO: BUSCAR DATAS COM PACIENTES RECEPCIONADOS
     * Para construir indicadores visuais no calendário
     *
     * @return Lista de mapas com data e quantidade de pacientes recepcionados
     */
    List<Map<String, Object>> buscarDatasComPacientesRecepcionados();


    /**
     * 📋 BUSCAR PACIENTES JÁ TRIADOS
     *
     * @return Lista de pacientes triados aguardando atendimento
     */
    List<PacienteTriadoDTO> findPacientesTriados();

    // ========================================
    // 🧠 BUSCA COM PROTOCOLO DETALHADO
    // ========================================

    /**
     * 🧠 BUSCAR TRIAGENS COM PROTOCOLO DETALHADO
     *
     * @param dataInicio Data/hora inicial do período
     * @param dataFim Data/hora final do período
     * @param protocoloNome Nome do protocolo (opcional)
     * @return Lista de triagens com informações detalhadas
     */
    List<TriagemComProtocoloDTO> buscarTriagensComProtocoloDetalhado(
            LocalDateTime dataInicio,
            LocalDateTime dataFim,
            String protocoloNome
    );

    // ========================================
    // 🔍 BUSCA POR CLASSIFICAÇÃO E PRIORIDADE
    // ========================================

    /**
     * 🔍 BUSCAR TRIAGENS PARA ATENDIMENTO MÉDICO
     *
     * @return Lista de triagens ordenadas por prioridade
     */
    List<Triagem> buscarTriagensParaAtendimento();

    /**
     * 🚨 BUSCAR TRIAGENS DE EMERGÊNCIA (VERMELHO)
     *
     * @return Lista de triagens classificadas como emergência
     */
    List<Triagem> buscarTriagensEmergencia();

    /**
     * 🚨 BUSCAR TRIAGENS CRÍTICAS (VERMELHO + LARANJA)
     *
     * @return Lista de triagens críticas
     */
    List<Triagem> buscarTriagensCriticas();

    /**
     * 🎯 BUSCAR TRIAGENS POR CLASSIFICAÇÃO ESPECÍFICA
     *
     * @param classificacao Classificação de risco desejada
     * @return Lista de triagens com a classificação especificada
     */
    List<Triagem> buscarTriagensPorClassificacao(ClassificacaoRisco classificacao);

    // ========================================
    // 🩺 BUSCA POR SINAIS VITAIS E SINTOMAS
    // ========================================

    /**
     * 😰 BUSCAR TRIAGENS COM DOR ALTA (≥7)
     *
     * @return Lista de triagens com dor intensa
     */
    List<Triagem> buscarTriagensComDorAlta();

    /**
     * 🩺 BUSCAR TRIAGENS COM SINAIS VITAIS ALTERADOS
     *
     * @return Lista de triagens com sinais vitais fora da normalidade
     */
    List<Triagem> buscarTriagensComSinaisVitaisAlterados();

    /**
     * 🔍 BUSCAR TRIAGENS POR QUEIXA PRINCIPAL
     *
     * @param palavraChave Palavra-chave para buscar na queixa
     * @return Lista de triagens com a palavra-chave na queixa
     */
    List<Triagem> buscarTriagensPorQueixa(String palavraChave);

    // ========================================
    // 👤 BUSCA POR PACIENTE E PROFISSIONAL
    // ========================================

    /**
     * 👤 BUSCAR HISTÓRICO DE TRIAGENS DO PACIENTE
     *
     * @param pacienteId ID do paciente
     * @return Lista de triagens do paciente
     */
    List<Triagem> buscarHistoricoTriagensPaciente(Long pacienteId);

    /**
     * 👨‍⚕️ BUSCAR TRIAGENS POR PROFISSIONAL
     *
     * @param profissionalId ID do profissional
     * @return Lista de triagens realizadas pelo profissional
     */
    List<Triagem> buscarTriagensPorProfissional(Long profissionalId);

    // ========================================
    // 📅 BUSCA POR PERÍODO
    // ========================================

    /**
     * 📅 BUSCAR TRIAGENS NO PERÍODO
     *
     * @param dataInicio Data/hora inicial
     * @param dataFim Data/hora final
     * @return Lista de triagens no período
     */
    List<Triagem> buscarTriagensNoPeriodo(LocalDateTime dataInicio, LocalDateTime dataFim);

    // ========================================
    // ✅ VALIDAÇÕES E VERIFICAÇÕES
    // ========================================

    /**
     * ✅ VERIFICAR SE PACIENTE JÁ FOI TRIADO HOJE
     *
     * @param pacienteId ID do paciente
     * @return true se já foi triado hoje
     */
    boolean pacienteJaTriadoHoje(Long pacienteId);

    // ========================================
    // 📊 ESTATÍSTICAS E RELATÓRIOS
    // ========================================

    /**
     * 📊 CONTAR TRIAGENS POR CLASSIFICAÇÃO NO PERÍODO
     *
     * @param dataInicio Data inicial
     * @param dataFim Data final
     * @return Mapa com contagem por classificação
     */
    Map<ClassificacaoRisco, Long> contarTriagensPorClassificacao(
            LocalDateTime dataInicio,
            LocalDateTime dataFim
    );

    /**
     * 📊 OBTER ESTATÍSTICAS COMPLETAS DO SISTEMA
     *
     * @return Mapa com estatísticas diversas
     */
    Map<String, Object> obterEstatisticasCompletas();

    /**
     * 📈 CALCULAR MÉDIA DE TRIAGENS POR DIA
     *
     * @param diasAtras Número de dias anteriores para cálculo
     * @return Média de triagens por dia
     */
    Double calcularMediaTriagensPorDia(int diasAtras);
}