// src/main/java/com/sistemadesaude/backend/dto/FarmaciaDTO.java

package com.sistemadesaude.backend.farmacia.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmaciaDTO {
    private Long id;
    private String nome;
    private String responsavelTecnico;
    private String telefone;
    private Long unidadeSaudeId;
}


