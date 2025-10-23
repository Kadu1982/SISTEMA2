package com.sistemadesaude.backend.saudefamilia.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AreaDTO {
    private Long id;
    private String descricao;
    private String ine;
    private String segmento;
    private Long unidadeId;
    private String tipoEquipe;
    private Boolean atendePopGeral;
    private Boolean atendeAssentados;
    private Boolean atendeQuilombolas;
    private String situacao;
    private Boolean importacaoCnes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
