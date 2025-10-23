package com.sistemadesaude.backend.recepcao.service;

import com.sistemadesaude.backend.recepcao.dto.AgendamentoDTO;
import com.sistemadesaude.backend.recepcao.dto.NovoAgendamentoRequest;

import java.time.LocalDate;
import java.util.List;

public interface AgendamentoService {

    AgendamentoDTO criarAgendamento(NovoAgendamentoRequest request);

    List<AgendamentoDTO> listarPorData(LocalDate data);

    // ✅ NOVO MÉTODO SEGURO ADICIONADO NA INTERFACE
    List<AgendamentoDTO> listarPorDataSeguro(LocalDate data);

    AgendamentoDTO buscarPorId(Long id);

    // ✅ NOVO MÉTODO COM PDF ADICIONADO NA INTERFACE
    AgendamentoDTO buscarPorIdComPdf(Long id);

    List<AgendamentoDTO> listarPorPaciente(Long pacienteId);

    AgendamentoDTO atualizarStatus(Long id, String novoStatus);

    boolean precisaSadt(Long agendamentoId);

    List<AgendamentoDTO> listarTodos();

    List<AgendamentoDTO> listarAguardandoTriagem();

    // ✅ MÉTODO PARA GERAR E ARMAZENAR PDF
    byte[] gerarEArmazenarComprovantePdf(Long agendamentoId);
}
