package com.sistemadesaude.backend.procedimentosrapidos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO de resposta para Escala de Morse
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EscalaMorseDTO {
    private Long id;
    private Long pacienteId;
    private String nomePaciente;
    private Integer historicoQuedas;
    private Integer diagnosticoSecundario;
    private Integer auxilioMarcha;
    private Integer terapiaEndovenosa;
    private Integer marcha;
    private Integer estadoMental;
    private Integer pontuacaoTotal;
    private String classificacaoRisco;
    private Long avaliadorId;
    private String nomeAvaliador;
    private LocalDateTime dataAvaliacao;
    private String observacoes;
}
