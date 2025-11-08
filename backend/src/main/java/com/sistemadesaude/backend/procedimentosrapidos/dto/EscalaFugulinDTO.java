package com.sistemadesaude.backend.procedimentosrapidos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO de resposta para Escala de Fugulin
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EscalaFugulinDTO {
    private Long id;
    private Long pacienteId;
    private String nomePaciente;
    private Integer estadoMental;
    private Integer oxigenacao;
    private Integer sinaisVitais;
    private Integer motilidade;
    private Integer deambulacao;
    private Integer alimentacao;
    private Integer cuidadoCorporal;
    private Integer eliminacao;
    private Integer terapeutica;
    private Integer pontuacaoTotal;
    private String classificacaoCuidado;
    private Long avaliadorId;
    private String nomeAvaliador;
    private LocalDateTime dataAvaliacao;
    private String observacoes;
}
