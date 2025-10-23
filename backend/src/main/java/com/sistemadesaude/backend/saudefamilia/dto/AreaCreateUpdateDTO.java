package com.sistemadesaude.backend.saudefamilia.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class AreaCreateUpdateDTO {
    @NotBlank
    private String descricao;

    @NotBlank
    @Size(max = 15)
    private String ine;

    private String segmento;
    private Long unidadeId;
    private String tipoEquipe;

    private Boolean atendePopGeral = Boolean.TRUE;
    private Boolean atendeAssentados = Boolean.FALSE;
    private Boolean atendeQuilombolas = Boolean.FALSE;

    @Pattern(regexp = "ATIVA|INATIVA", message = "situacao deve ser ATIVA ou INATIVA")
    private String situacao = "ATIVA";

    private Boolean importacaoCnes = Boolean.FALSE;
}
