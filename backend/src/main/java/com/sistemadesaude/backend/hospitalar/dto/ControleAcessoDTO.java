package com.sistemadesaude.backend.hospitalar.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ControleAcessoDTO {

    private Long id;

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

    private Long responsavelLiberacaoId;

    private LocalDateTime dataEntrada;

    private LocalDateTime dataSaida;

    @Size(max = 500, message = "Observações não podem exceder 500 caracteres")
    private String observacoes;

    @Size(max = 20, message = "Número do crachá não pode exceder 20 caracteres")
    private String numeroCracha;

    private String fotoPath;

    private String status;

    @NotNull(message = "ID da unidade é obrigatório")
    private Long unidadeId;

    // Campos auxiliares para exibição
    private String nomePaciente;
    private String nomeResponsavelLiberacao;
    private String nomeUnidade;
    private String tipoDocumentoDescricao;
    private String tipoVisitanteDescricao;
    private String statusDescricao;
    private String tempoPermancencia;
    private String dataEntradaFormatada;
    private String dataSaidaFormatada;
}