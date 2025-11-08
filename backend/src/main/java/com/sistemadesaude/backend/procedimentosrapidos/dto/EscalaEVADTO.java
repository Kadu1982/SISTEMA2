package com.sistemadesaude.backend.procedimentosrapidos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO de resposta para Escala EVA
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EscalaEVADTO {
    private Long id;
    private Long pacienteId;
    private String nomePaciente;
    private Integer pontuacaoDor;
    private String classificacaoDor;
    private String localizacaoDor;
    private String caracteristicasDor;
    private String fatoresPiora;
    private String fatoresMelhora;
    private Long avaliadorId;
    private String nomeAvaliador;
    private LocalDateTime dataAvaliacao;
    private String observacoes;
}
