package com.sistemadesaude.backend.hospitalar.dto;

import com.sistemadesaude.backend.hospitalar.entity.SenhaAtendimento;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmitirSenhaRequest {

    @NotNull(message = "ID da fila é obrigatório")
    private Long filaId;

    @NotNull(message = "Tipo da senha é obrigatório")
    private SenhaAtendimento.TipoSenha tipoSenha;

    private Long pacienteId;
}