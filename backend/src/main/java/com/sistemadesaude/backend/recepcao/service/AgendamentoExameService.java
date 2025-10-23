package com.sistemadesaude.backend.recepcao.service;

import com.sistemadesaude.backend.recepcao.dto.AgendamentoExameDTO;
import com.sistemadesaude.backend.recepcao.dto.NovoAgendamentoExameRequest;
import com.sistemadesaude.backend.recepcao.entity.AgendamentoExame.StatusAgendamentoExame;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Interface do serviço de agendamento de exames
 */
public interface AgendamentoExameService {
    
    /**
     * Cria novo agendamento de exame
     */
    AgendamentoExameDTO criarAgendamento(NovoAgendamentoExameRequest request);
    
    /**
     * Busca agendamento por ID
     */
    AgendamentoExameDTO buscarPorId(Long id);
    
    /**
     * Busca agendamento por protocolo
     */
    AgendamentoExameDTO buscarPorProtocolo(String protocolo);
    
    /**
     * Lista agendamentos por paciente
     */
    List<AgendamentoExameDTO> listarPorPaciente(Long pacienteId);
    
    /**
     * Lista agendamentos por data
     */
    List<AgendamentoExameDTO> listarPorData(LocalDate data);
    
    /**
     * Lista agendamentos por período
     */
    List<AgendamentoExameDTO> listarPorPeriodo(LocalDateTime dataInicio, LocalDateTime dataFim);
    
    /**
     * Lista agendamentos por status
     */
    List<AgendamentoExameDTO> listarPorStatus(StatusAgendamentoExame status);

    /**
     * Lista agendamentos por unidade
     */
    List<AgendamentoExameDTO> listarPorUnidade(Long unidadeId);

    /**
     * Confirma agendamento
     */
    AgendamentoExameDTO confirmarAgendamento(Long id, String usuario);

    /**
     * Cancela agendamento
     */
    AgendamentoExameDTO cancelarAgendamento(Long id, String motivo, String usuario);

    /**
     * Marca agendamento como realizado
     */
    AgendamentoExameDTO marcarRealizado(Long id, String usuario);

    /**
     * Gera comprovante em PDF para o agendamento
     */
    byte[] gerarComprovantePdf(Long agendamentoId);
    
    /**
     * Marca como não compareceu
     */
    AgendamentoExameDTO marcarNaoCompareceu(Long id, String usuario);
    
    /**
     * Reagenda agendamento
     */
    AgendamentoExameDTO reagendar(Long id, LocalDateTime novaDataHora, String motivo, String usuario);
    
    /**
     * Atualiza status do agendamento
     */
    AgendamentoExameDTO atualizarStatus(Long id, StatusAgendamentoExame novoStatus, String usuario);
    
    /**
     * Lista agendamentos pendentes de confirmação
     */
    List<AgendamentoExameDTO> listarPendentesConfirmacao();
    
    /**
     * Lista agendamentos atrasados
     */
    List<AgendamentoExameDTO> listarAtrasados();
    
    /**
     * Verifica disponibilidade de horário
     */
    boolean verificarDisponibilidade(Long horarioExameId, LocalDateTime dataHora);
    
    /**
     * Gera comprovante PDF
     */
    //byte[] gerarComprovantePdf(Long id);
    
    /**
     * Busca agenda do dia para profissional
     */
    List<AgendamentoExameDTO> buscarAgendaDiaProfissional(Long profissionalId, LocalDate data);
}