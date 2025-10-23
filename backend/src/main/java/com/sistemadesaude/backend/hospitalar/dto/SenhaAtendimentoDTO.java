package com.sistemadesaude.backend.hospitalar.dto;

import com.sistemadesaude.backend.hospitalar.entity.SenhaAtendimento;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SenhaAtendimentoDTO {

    private Long id;
    private Long filaId;
    private String nomeFila;
    private String numeroSenha;
    private Integer sequencia;
    private SenhaAtendimento.TipoSenha tipoSenha;
    private Long pacienteId;
    private String nomePaciente;
    private SenhaAtendimento.StatusSenha status;
    private LocalDateTime dataEmissao;
    private LocalDateTime dataChamada;
    private LocalDateTime dataAtendimento;
    private LocalDateTime dataConclusao;
    private String posicaoGuiche;
    private String salaConsultorio;
    private Long operadorChamadaId;
    private String nomeOperadorChamada;
    private Long operadorAtendimentoId;
    private String nomeOperadorAtendimento;
    private String motivoCancelamento;
    private String observacoes;
    private Integer tempoEsperaMinutos;
}