package com.sistemadesaude.backend.procedimentosrapidos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO de resposta para Escala de Braden
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EscalaBradenDTO {
    private Long id;
    private Long pacienteId;
    private String nomePaciente;
    private Integer percepcaoSensorial;
    private Integer umidade;
    private Integer atividade;
    private Integer mobilidade;
    private Integer nutricao;
    private Integer friccaoCisalhamento;
    private Integer pontuacaoTotal;
    private String classificacaoRisco;
    private Long avaliadorId;
    private String nomeAvaliador;
    private LocalDateTime dataAvaliacao;
    private String observacoes;
}
