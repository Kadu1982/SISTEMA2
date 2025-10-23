package com.sistemadesaude.backend.estoque.dto;

import com.sistemadesaude.backend.estoque.enums.TipoControleEstoque;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class InsumoDTO {
    private Long id;
    private String descricao;
    private String apresentacao;
    private String dosagem;
    private String descricaoCompleta;
    private String unidadeMedida;
    private TipoControleEstoque controleEstoque;
    private Integer diasAlertaVencimento;
    private String codigoBarrasPadrao;
    private boolean ativo;
}
