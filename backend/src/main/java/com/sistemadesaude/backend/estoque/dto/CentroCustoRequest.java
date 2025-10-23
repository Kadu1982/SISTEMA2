package com.sistemadesaude.backend.estoque.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.sistemadesaude.backend.estoque.enums.GeracaoEntradaTransferencia;
import com.sistemadesaude.backend.estoque.enums.PoliticaCodigoSequencial;
import lombok.*;

/**
 * Payload para criação/atualização (PUT/PATCH).
 * Campos são opcionais para permitir PATCH parcial.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CentroCustoRequest {
    private String nome;
    private Long unidadeSaudeId;
    private PoliticaCodigoSequencial politicaCodigoSequencial;
    private GeracaoEntradaTransferencia geracaoEntradaTransferencia;
    private Boolean usaCodigoBarrasPorLote;
    private Boolean ativo;
}
