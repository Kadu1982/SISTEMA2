package com.sistemadesaude.backend.exames.dto;

import com.sistemadesaude.backend.exames.entity.RecepcaoExame;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CriarRecepcaoRequest {
    private Long pacienteId;
    private Long unidadeId;
    private Long profissionalSolicitanteId;
    private Long agendamentoId;
    private Boolean urgente;
    private String observacoes;

    // Biometria
    private String biometriaTemplate;

    // Convênio
    private Long convenioId;
    private String numeroCarteirinha;
    private RecepcaoExame.TipoAtendimento tipoAtendimento;

    // Exames
    private List<ExameSolicitadoDTO> exames;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExameSolicitadoDTO {
        private Long exameId;
        private Long motivoExameId;
        private Integer quantidade;
        private Boolean autorizado;
        private String numeroAutorizacao;
        private String observacoes;
    }
}