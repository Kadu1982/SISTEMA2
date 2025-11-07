package com.sistemadesaude.backend.recepcao.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para atualização de status de agendamento
 * Valida que o status é informado
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AtualizarStatusAgendamentoRequest {
    
    @NotBlank(message = "Status é obrigatório")
    private String status;
}
