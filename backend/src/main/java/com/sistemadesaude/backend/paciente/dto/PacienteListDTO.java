package com.sistemadesaude.backend.paciente.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO simplificado para listagem de pacientes.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PacienteListDTO {
    private Long id;
    private String nomeCompleto;
    private String nomeSocial;
    private String cpf;
    private String cns;
    private LocalDate dataNascimento;
    private String municipio;
    private String telefoneCelular;
}
