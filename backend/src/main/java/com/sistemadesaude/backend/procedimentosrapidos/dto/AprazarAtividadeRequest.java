package com.sistemadesaude.backend.procedimentosrapidos.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AprazarAtividadeRequest {

    @NotNull(message = "O novo horário é obrigatório")
    private LocalDateTime novoHorario;

    private String motivoAlteracao;
}
