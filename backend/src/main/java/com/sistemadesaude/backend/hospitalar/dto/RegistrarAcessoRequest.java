package com.sistemadesaude.backend.hospitalar.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistrarAcessoRequest {

    @NotBlank(message = "Nome é obrigatório")
    @Size(max = 100, message = "Nome não pode exceder 100 caracteres")
    private String nome;

    @NotBlank(message = "Documento é obrigatório")
    @Size(max = 50, message = "Documento não pode exceder 50 caracteres")
    private String documento;

    @NotNull(message = "Tipo de documento é obrigatório")
    private String tipoDocumento;

    @NotNull(message = "Tipo de visitante é obrigatório")
    private String tipoVisitante;

    private Long pacienteId;

    @Size(max = 50, message = "Grau de parentesco não pode exceder 50 caracteres")
    private String grauParentesco;

    @Size(max = 20, message = "Telefone não pode exceder 20 caracteres")
    private String telefone;

    @Size(max = 100, message = "Empresa/Fornecedor não pode exceder 100 caracteres")
    private String empresaFornecedor;

    @Size(max = 100, message = "Setor de destino não pode exceder 100 caracteres")
    private String setorDestino;

    @Size(max = 500, message = "Observações não podem exceder 500 caracteres")
    private String observacoes;

    @NotNull(message = "ID da unidade é obrigatório")
    private Long unidadeId;
}