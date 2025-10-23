package com.sistemadesaude.backend.upa.dto;

import lombok.Data;

/** DTO para desfechos rápidos de atendimento UPA. */
@Data
public class DesfechoAtendimentoRequest {
    private String observacoes; // opcional
    private String setorDestino; // opcional (observacao/encaminhamento)
    private Integer prazoMinutos; // opcional (reavaliacao)
}
