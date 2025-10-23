package com.sistemadesaude.backend.exames.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaterialExameDTO {
    private Long id;
    private String codigo;
    private String sigla;
    private String descricao;
    private Boolean ativo;
    private Integer quantidade;
    private Boolean obrigatorio;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}