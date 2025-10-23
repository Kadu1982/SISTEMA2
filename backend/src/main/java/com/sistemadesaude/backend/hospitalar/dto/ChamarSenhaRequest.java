package com.sistemadesaude.backend.hospitalar.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChamarSenhaRequest {

    @NotNull(message = "ID da fila é obrigatório")
    private Long filaId;

    @NotNull(message = "ID do operador é obrigatório")
    private Long operadorId;

    @NotNull(message = "Posição do guichê é obrigatória")
    private String posicaoGuiche;
}