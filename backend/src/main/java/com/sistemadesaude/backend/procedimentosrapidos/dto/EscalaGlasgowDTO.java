package com.sistemadesaude.backend.procedimentosrapidos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO de resposta para Escala de Glasgow
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EscalaGlasgowDTO {
    private Long id;
    private Long pacienteId;
    private String nomePaciente;
    private Integer aberturaOcular;
    private Integer respostaVerbal;
    private Integer respostaMotora;
    private Integer pontuacaoTotal;
    private String classificacaoNivelConsciencia;
    private Long avaliadorId;
    private String nomeAvaliador;
    private LocalDateTime dataAvaliacao;
    private String observacoes;
}
