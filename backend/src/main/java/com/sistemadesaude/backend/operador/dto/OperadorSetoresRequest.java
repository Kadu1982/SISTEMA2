package com.sistemadesaude.backend.operador.dto;

import lombok.*;

import java.util.List;

/** Payload simples: lista de IDs de setores */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OperadorSetoresRequest {
    private List<Long> setorIds;
}
