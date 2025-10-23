package com.sistemadesaude.backend.estoque.dto;

import com.sistemadesaude.backend.estoque.enums.GeracaoEntradaTransferencia;
import com.sistemadesaude.backend.estoque.enums.PoliticaCodigoSequencial;
import lombok.*;

/**
 * DTO "alias" para expor LocalArmazenamento com a nomenclatura preferida "Centro de Custo".
 * Não muda nada no domínio; serve para a apresentação/contrato de API.
 */
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CentroCustoDTO {
    private Long id;
    private String nome;
    private Long unidadeSaudeId;
    private PoliticaCodigoSequencial politicaCodigoSequencial;
    private GeracaoEntradaTransferencia geracaoEntradaTransferencia;
    private boolean usaCodigoBarrasPorLote;
    private boolean ativo;
}
