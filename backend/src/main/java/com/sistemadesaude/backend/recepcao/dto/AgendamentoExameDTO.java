package com.sistemadesaude.backend.recepcao.dto;

import com.sistemadesaude.backend.recepcao.entity.AgendamentoExame;
import com.sistemadesaude.backend.recepcao.entity.HorarioExame;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * DTO de resposta para agendamento de exame
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgendamentoExameDTO {
    
    private Long id;
    private String protocolo;
    
    // Dados do paciente
    private Long pacienteId;
    private String pacienteNome;
    private String pacienteCpf;
    private String pacienteTelefone;
    
    // Dados do agendamento
    private LocalDateTime dataAgendamento;
    private LocalDateTime dataHoraExame;
    private Long horarioExameId;
    
    // Profissional e local
    private Long profissionalId;
    private String profissionalNome;
    private Long salaId;
    private String salaNome;
    private Long unidadeId;
    private String unidadeNome;
    
    // Status e tipo
    private AgendamentoExame.StatusAgendamentoExame status;
    private HorarioExame.TipoAgendamentoExame tipoAgendamento;
    
    // Solicitação
    private String origemSolicitacao;
    private Long solicitanteId;
    private String solicitanteNome;
    private String autorizacaoConvenio;
    private String guiaConvenio;
    
    // Exames
    private List<ExameAgendadoDTO> examesAgendados;
    
    // Informações adicionais
    private String observacoes;
    private String preparacaoPaciente;
    private String contatoPaciente;
    private String emailPaciente;
    
    // Confirmação
    private Boolean confirmado;
    private LocalDateTime dataConfirmacao;
    private String usuarioConfirmacao;
    
    // Flags
    private Boolean encaixe;
    private Boolean prioridade;
    
    // Cancelamento
    private String motivoCancelamento;
    private LocalDateTime dataCancelamento;
    private String usuarioCancelamento;
    
    // Realização
    private LocalDateTime dataRealizacao;
    private String usuarioRealizacao;
    
    // Comprovante
    private String comprovantePdf;
    
    // Auditoria
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAtualizacao;
    private String usuarioCriacao;
    private String usuarioAtualizacao;
    
    // Dados calculados
    private Integer duracaoTotalEstimada;
    private Boolean requerPreparoEspecial;
    private Boolean atrasado;
    private Boolean podeSerCancelado;
    private Boolean podeSerConfirmado;
    private Boolean podeSerRealizado;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExameAgendadoDTO {
        private String exameCodigo;
        private String exameNome;
        private String categoria;
        private Integer duracaoEstimada;
        private Boolean requerPreparo;
        private String descricaoPreparo;
        private String observacoesEspecificas;
        private String materialColeta;
        private String quantidadeMaterial;
        
        public static ExameAgendadoDTO fromEntity(AgendamentoExame.ExameAgendado entity) {
            return ExameAgendadoDTO.builder()
                    .exameCodigo(entity.getExameCodigo())
                    .exameNome(entity.getExameNome())
                    .categoria(entity.getCategoria())
                    .duracaoEstimada(entity.getDuracaoEstimada())
                    .requerPreparo(entity.getRequerPreparo())
                    .descricaoPreparo(entity.getDescricaoPreparo())
                    .observacoesEspecificas(entity.getObservacoesEspecificas())
                    .materialColeta(entity.getMaterialColeta())
                    .quantidadeMaterial(entity.getQuantidadeMaterial())
                    .build();
        }
    }

    public static AgendamentoExameDTO fromEntity(AgendamentoExame entity) {
        return AgendamentoExameDTO.builder()
                .id(entity.getId())
                .protocolo(entity.getProtocolo())
                .pacienteId(entity.getPaciente().getId())
                .pacienteNome(entity.getPaciente().getNomeCompleto())
                .pacienteCpf(entity.getPaciente().getCpf())
                .pacienteTelefone(entity.getContatoPaciente())
                .dataAgendamento(entity.getDataAgendamento())
                .dataHoraExame(entity.getDataHoraExame())
                .horarioExameId(entity.getHorarioExame() != null ? entity.getHorarioExame().getId() : null)
                .profissionalId(entity.getProfissionalId())
                .profissionalNome(entity.getProfissionalNome())
                .salaId(entity.getSalaId())
                .salaNome(entity.getSalaNome())
                .unidadeId(entity.getUnidadeId())
                .unidadeNome(entity.getUnidadeNome())
                .status(entity.getStatus())
                .tipoAgendamento(entity.getTipoAgendamento())
                .origemSolicitacao(entity.getOrigemSolicitacao())
                .solicitanteId(entity.getSolicitanteId())
                .solicitanteNome(entity.getSolicitanteNome())
                .autorizacaoConvenio(entity.getAutorizacaoConvenio())
                .guiaConvenio(entity.getGuiaConvenio())
                .examesAgendados(entity.getExamesAgendados().stream()
                        .map(ExameAgendadoDTO::fromEntity)
                        .collect(Collectors.toList()))
                .observacoes(entity.getObservacoes())
                .preparacaoPaciente(entity.getPreparacaoPaciente())
                .contatoPaciente(entity.getContatoPaciente())
                .emailPaciente(entity.getEmailPaciente())
                .confirmado(entity.getConfirmado())
                .dataConfirmacao(entity.getDataConfirmacao())
                .usuarioConfirmacao(entity.getUsuarioConfirmacao())
                .encaixe(entity.getEncaixe())
                .prioridade(entity.getPrioridade())
                .motivoCancelamento(entity.getMotivoCancelamento())
                .dataCancelamento(entity.getDataCancelamento())
                .usuarioCancelamento(entity.getUsuarioCancelamento())
                .dataRealizacao(entity.getDataRealizacao())
                .usuarioRealizacao(entity.getUsuarioRealizacao())
                .comprovantePdf(entity.getComprovantePdf())
                .dataCriacao(entity.getDataCriacao())
                .dataAtualizacao(entity.getDataAtualizacao())
                .usuarioCriacao(entity.getUsuarioCriacao())
                .usuarioAtualizacao(entity.getUsuarioAtualizacao())
                .duracaoTotalEstimada(entity.getDuracaoTotalEstimada())
                .requerPreparoEspecial(entity.requerPreparoEspecial())
                .atrasado(entity.isAtrasado())
                .podeSerCancelado(entity.podeSerCancelado())
                .podeSerConfirmado(entity.podeSerConfirmado())
                .podeSerRealizado(entity.podeSerRealizado())
                .build();
    }
}