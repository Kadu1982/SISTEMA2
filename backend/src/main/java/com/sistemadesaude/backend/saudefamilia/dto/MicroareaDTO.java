package com.sistemadesaude.backend.saudefamilia.dto;

import lombok.Data;

@Data
public class MicroareaDTO {
    private Long id;
    private Long areaId;
    private Integer codigo;
    private Long profissionalResponsavelId;
    private String situacao;
}
