package com.sistemadesaude.backend.operador.dto;

import lombok.*;

import java.util.List;

/** Vincular/desvincular unidades de saúde do operador */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OperadorUnidadesRequest {
    private List<Long> unidadeIds;
}
