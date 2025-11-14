package com.sistemadesaude.backend.paciente.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO (Data Transfer Object) para transferência de dados de Paciente entre camadas.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PacienteDTO {
    private Long id;
    private String nomeCompleto;
    private String nomeSocial;
    private String nomeMae;
    private String cpf;
    private String justificativaAusenciaCpf;
    private String cns;
    private String sexo;
    private LocalDate dataNascimento;
    private Boolean acamado;
    private Boolean domiciliado;
    private Boolean condSaudeMental;
    private Boolean usaPlantas;
    private String outrasCondicoes;

    // Endereço
    private String municipio;
    private String cep;
    private String logradouro;
    private String numero;
    private String bairro;
    private String complemento;

    // Contato
    private String telefoneCelular;
    private String telefoneContato;

    // Documentos
    private String tipoSanguineo;
    private String rg;
    private String orgaoEmissor;
    private String certidaoNascimento;
    private String carteiraTrabalho;
    private String tituloEleitor;

    // Outros dados
    private String prontuarioFamiliar;
    private String corRaca;
    private String etnia;
    private String escolaridade;
    private String situacaoFamiliar;
    private String alergias;
}
