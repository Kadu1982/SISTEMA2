package com.sistemadesaude.backend.operador.dto;

import lombok.*;

import java.util.List;

/** Overrides de módulos (strings) no operador */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OperadorModulosRequest {
    private List<String> modulos;
}
