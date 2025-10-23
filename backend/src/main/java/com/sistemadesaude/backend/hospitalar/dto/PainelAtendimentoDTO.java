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
public class PainelAtendimentoDTO {

    private Long id;

    @NotBlank(message = "Nome é obrigatório")
    @Size(max = 100, message = "Nome não pode exceder 100 caracteres")
    private String nome;

    @NotBlank(message = "Localização é obrigatória")
    @Size(max = 100, message = "Localização não pode exceder 100 caracteres")
    private String localizacao;

    private Long filaId;

    private String configuracaoCampos; // JSON

    private String configuracaoLayout; // JSON

    private Boolean chamadaTelaCheia = false;

    private Boolean chamadaComSom = true;

    private Boolean chamadaComVoz = true;

    private String tipoVoz = "FEMININA";

    private Boolean exibirDirecao = true;

    private Boolean exibirLocal = true;

    private Boolean exibirUltimasSenhas = true;

    private Integer qtdUltimasSenhas = 5;

    private Boolean exibirMultimedia = false;

    private String multimediaConfig; // JSON

    private Boolean exibirFilaEspera = true;

    private Boolean exibirTempoEspera = true;

    private Boolean ativo = true;

    @NotNull(message = "ID da unidade é obrigatório")
    private Long unidadeId;

    private Long setorId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Campos auxiliares para exibição
    private String nomeFila;
    private String nomeUnidade;
    private String nomeSetor;
    private String tipoVozDescricao;
    private String createdAtFormatado;
    private String updatedAtFormatado;
    private Integer totalSenhasFilaEspera;
    private String tempoMedioEspera;
}