package com.sistemadesaude.backend.imunizacao.dto;

import com.sistemadesaude.backend.imunizacao.enums.TipoVacina;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VacinaDTO {

    private Long id;

    @NotBlank(message = "Código é obrigatório")
    @Size(max = 10, message = "Código deve ter no máximo 10 caracteres")
    private String codigo;

    @NotBlank(message = "Nome é obrigatório")
    @Size(max = 200, message = "Nome deve ter no máximo 200 caracteres")
    private String nome;

    @Size(max = 500, message = "Descrição deve ter no máximo 500 caracteres")
    private String descricao;

    @NotNull(message = "Tipo da vacina é obrigatório")
    private TipoVacina tipoVacina;

    @Size(max = 20, message = "Código LEDI e-SUS deve ter no máximo 20 caracteres")
    private String codigoLediEsus;

    @Size(max = 20, message = "Código PNI deve ter no máximo 20 caracteres")
    private String codigoPni;

    private Boolean ativa;
    private Boolean exportarSipni;
    private Boolean exportarRnds;
    private Boolean calendarioVacinal;

    private Integer idadeMinimaEmDias;
    private Integer idadeMaximaEmDias;
    private Integer intervaloMinimoDosesEmDias;
    private Integer numeroDosesEsquema;
}