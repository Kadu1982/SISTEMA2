package com.sistemadesaude.backend.estoque.dto;

import com.sistemadesaude.backend.estoque.enums.GeracaoEntradaTransferencia;
import com.sistemadesaude.backend.estoque.enums.PoliticaCodigoSequencial;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class LocalArmazenamentoDTO {
    private Long id;
    private String nome;
    private Long unidadeSaudeId;
    private PoliticaCodigoSequencial politicaCodigoSequencial;
    private GeracaoEntradaTransferencia geracaoEntradaTransferencia;
    private boolean usaCodigoBarrasPorLote;
    private boolean ativo;
}
