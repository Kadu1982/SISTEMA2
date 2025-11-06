package com.sistemadesaude.backend.procedimentosrapidos.service;

import com.sistemadesaude.backend.procedimentosrapidos.dto.*;
import com.sistemadesaude.backend.procedimentosrapidos.enums.StatusProcedimento;

import java.time.LocalDateTime;
import java.util.List;

public interface ProcedimentoRapidoService {

    /**
     * Cria um novo procedimento rápido
     */
    ProcedimentoRapidoDTO criar(CriarProcedimentoRapidoRequest request, String operadorLogin);

    /**
     * Busca procedimento por ID
     */
    ProcedimentoRapidoDTO buscarPorId(Long id);

    /**
     * Lista todos os procedimentos
     */
    List<ProcedimentoRapidoListDTO> listarTodos();

    /**
     * Lista procedimentos com filtros
     */
    List<ProcedimentoRapidoListDTO> listarComFiltros(
            LocalDateTime dataInicio,
            LocalDateTime dataFim,
            StatusProcedimento status
    );

    /**
     * Lista procedimentos aguardando atendimento
     */
    List<ProcedimentoRapidoListDTO> listarAguardando();

    /**
     * Lista procedimentos em atendimento por operador
     */
    List<ProcedimentoRapidoListDTO> listarEmAtendimentoPorOperador(Long operadorId);

    /**
     * Lista procedimentos com atividades urgentes
     */
    List<ProcedimentoRapidoListDTO> listarComAtividadesUrgentes();

    /**
     * Atualiza o status do procedimento
     */
    ProcedimentoRapidoDTO atualizarStatus(Long id, StatusProcedimento novoStatus, String operadorLogin);

    /**
     * Inicia atendimento (muda status e bloqueia para operador)
     */
    ProcedimentoRapidoDTO iniciarAtendimento(Long id, Long operadorId, String operadorLogin);

    /**
     * Adiciona uma atividade ao procedimento
     */
    ProcedimentoRapidoDTO adicionarAtividade(Long id, AtividadeEnfermagemDTO atividadeDTO, String operadorLogin);

    /**
     * Executa uma atividade (atualiza situação)
     */
    ProcedimentoRapidoDTO executarAtividade(Long procedimentoId, Long atividadeId, ExecutarAtividadeRequest request, String operadorLogin);

    /**
     * Realiza aprazamento de horários de uma atividade
     */
    ProcedimentoRapidoDTO aprazarAtividade(Long procedimentoId, Long atividadeId, AprazarAtividadeRequest request, String operadorLogin);

    /**
     * Registra o desfecho do procedimento e finaliza
     */
    ProcedimentoRapidoDTO registrarDesfecho(Long id, RegistrarDesfechoRequest request, String operadorLogin);

    /**
     * Cancela o procedimento
     */
    ProcedimentoRapidoDTO cancelar(Long id, CancelarProcedimentoRequest request, String operadorLogin);

    /**
     * Desbloqueia procedimento para outro operador
     */
    ProcedimentoRapidoDTO desbloquear(Long id, Long operadorId);

    /**
     * Busca histórico completo do procedimento
     */
    ProcedimentoRapidoDTO obterHistorico(Long id);

    /**
     * Encaminha paciente do Atendimento Ambulatorial para Procedimentos Rápidos
     */
    ProcedimentoRapidoDTO encaminharDeAtendimento(EncaminharParaProcedimentoRequest request, String operadorLogin);
}
