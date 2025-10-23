package com.sistemadesaude.backend.recepcao.dto;

import com.sistemadesaude.backend.recepcao.entity.AgendamentoExame;
import com.sistemadesaude.backend.recepcao.entity.HorarioExame;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO para criação de novo agendamento de exame
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NovoAgendamentoExameRequest {
    
    private Long pacienteId;
    private LocalDateTime dataHoraExame;
    private Long horarioExameId;
    private Long profissionalId;
    private Long salaId;
    private Long unidadeId;
    private HorarioExame.TipoAgendamentoExame tipoAgendamento;
    private String origemSolicitacao;
    private Long solicitanteId;
    private String solicitanteNome;
    private String autorizacaoConvenio;
    private String guiaConvenio;
    private List<ExameRequest> exames;
    private String observacoes;
    private String preparacaoPaciente;
    private String contatoPaciente;
    private String emailPaciente;
    private Boolean encaixe = false;
    private Boolean prioridade = false;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExameRequest {
        private String exameCodigo;
        private String exameNome;
        private String categoria;
        private Integer duracaoEstimada;
        private Boolean requerPreparo;
        private String descricaoPreparo;
        private String observacoesEspecificas;
        private String materialColeta;
        private String quantidadeMaterial;
    }
}