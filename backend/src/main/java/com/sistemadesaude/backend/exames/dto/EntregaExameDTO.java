package com.sistemadesaude.backend.exames.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EntregaExameDTO {
    private Long id;
    private Long recepcaoId;
    private String numeroRecepcao;
    private String pacienteNome;
    private LocalDateTime dataEntrega;
    private String operadorEntrega;

    // Identificação de quem retirou
    private String nomeRetirou;
    private String documentoRetirou;
    private String parentescoRetirou;

    // Validação
    private Boolean biometriaValidada;
    private Boolean documentoValidado;

    // Exames entregues
    private List<ExameEntregueDTO> examesEntregues;

    private String observacoes;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExameEntregueDTO {
        private Long exameRecepcaoId;
        private String exameNome;
        private Integer viasImpressas;
    }
}