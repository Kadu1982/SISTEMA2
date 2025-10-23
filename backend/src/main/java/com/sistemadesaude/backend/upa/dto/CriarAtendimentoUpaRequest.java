package com.sistemadesaude.backend.upa.dto;

import lombok.Data;

/** Payload de POST /api/upa/atendimentos */
@Data
public class CriarAtendimentoUpaRequest {
    private Long ocorrenciaId;     // Upa.id (obrigatório)
    private Long triagemId;        // TriagemUpa.id (obrigatório)
    private Long pacienteId;       // Paciente.id (obrigatório)

    private String cid10;          // obrigatório
    private String anamnese;
    private String exameFisico;
    private String hipoteseDiagnostica;
    private String conduta;
    private String prescricao;
    private String observacoes;
    private String retorno;

    private String statusAtendimento; // EM_ANDAMENTO | CONCLUIDO | CANCELADO
}
