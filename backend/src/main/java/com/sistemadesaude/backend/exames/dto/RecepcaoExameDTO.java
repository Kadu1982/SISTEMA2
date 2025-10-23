package com.sistemadesaude.backend.exames.dto;

import com.sistemadesaude.backend.exames.entity.RecepcaoExame;
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
public class RecepcaoExameDTO {
    private Long id;
    private String numeroRecepcao;
    private String codigoBarras;

    private Long pacienteId;
    private String pacienteNome;
    private String pacienteCpf;
    private String pacienteDataNascimento;

    private Long unidadeId;
    private String unidadeNome;

    private Long profissionalSolicitanteId;
    private String profissionalSolicitanteNome;

    private Long agendamentoId;
    private LocalDateTime dataRecepcao;
    private RecepcaoExame.StatusRecepcao status;
    private Boolean urgente;
    private String observacoes;

    // Biometria
    private Boolean biometriaColetada;

    // Convênio
    private Long convenioId;
    private String numeroCarteirinha;
    private RecepcaoExame.TipoAtendimento tipoAtendimento;

    // Exames solicitados
    private List<ExameRecepcaoDTO> exames;

    // Auditoria
    private String operadorRecepcao;
    private LocalDateTime createdAt;
}