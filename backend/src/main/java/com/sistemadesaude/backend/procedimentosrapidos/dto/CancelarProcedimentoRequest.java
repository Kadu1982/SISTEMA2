package com.sistemadesaude.backend.procedimentosrapidos.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CancelarProcedimentoRequest {

    @NotBlank(message = "O motivo do cancelamento é obrigatório")
    private String motivo;

    /**
     * Observações adicionais sobre o cancelamento.
     * Obrigatório quando há atividades pendentes não executadas.
     */
    private String observacoes;

    /**
     * Indica se deve cancelar todas as atividades pendentes automaticamente.
     * Se false, o sistema solicitará confirmação.
     */
    @Builder.Default
    private Boolean cancelarAtividadesPendentes = false;
}
