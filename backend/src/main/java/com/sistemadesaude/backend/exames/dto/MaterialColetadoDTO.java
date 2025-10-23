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
public class MaterialColetadoDTO {
    private Long id;
    private Long coletaId;
    private Long exameRecepcaoId;
    private String exameNome;
    private Long materialId;
    private String materialSigla;
    private String materialDescricao;
    private Integer quantidade;
    private String codigoTubo;
    private Boolean etiquetaImpressa;
    private String observacoes;

    // Nova coleta
    private Boolean novaColeta;
    private Long motivoNovaColetaId;
    private String motivoNovaColetaDescricao;
    private LocalDateTime dataNovaColeta;
}