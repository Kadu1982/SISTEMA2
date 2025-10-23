package com.sistemadesaude.backend.samu.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperadorResumoDTO {

    private Long id;
    private String nome;
    private String cpf;
    private String telefone;
    private String email;

    // Informações profissionais
    private String funcao;
    private String especialidade;
    private String numeroRegistro; // CRM, COREN, etc.
    private String conselhoRegional;

    // Status atual
    private Boolean ativo;
    private String statusAtual; // DISPONIVEL, OCUPADO, AUSENTE
    private LocalDateTime inicioTurno;
    private LocalDateTime fimTurno;

    // Central associada
    private Long centralRegulacaoId;
    private String centralRegulacaoNome;

    // Estatísticas do operador
    private Long totalOcorrenciasHoje;
    private Long totalOcorrenciasMes;
    private Double tempoMedioAtendimento;

    // Informações de experiência
    private Integer anosExperiencia;
    private String nivelExperiencia; // JUNIOR, PLENO, SENIOR

    // Avatar e identificação visual
    private String avatar;
    private String corIdentificacao;
}
