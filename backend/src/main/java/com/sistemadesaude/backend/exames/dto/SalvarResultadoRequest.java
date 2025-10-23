package com.sistemadesaude.backend.exames.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalvarResultadoRequest {
    private Long exameRecepcaoId;
    private Long metodoId;
    private String resultadoTexto;
    private Map<Long, String> valoresCampos; // campoId -> valor
    private String observacoes;
    private Boolean liberarLaudo;
}