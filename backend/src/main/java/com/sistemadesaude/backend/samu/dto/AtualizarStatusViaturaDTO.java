package com.sistemadesaude.backend.samu.dto;

import com.sistemadesaude.backend.samu.enums.StatusViatura;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para Atualizar Status de Viatura
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtualizarStatusViaturaDTO {

    @NotNull(message = "Status é obrigatório")
    private StatusViatura novoStatus;

    private String observacao;
    private Long ocorrenciaId; // Se status está relacionado a uma ocorrência
}
