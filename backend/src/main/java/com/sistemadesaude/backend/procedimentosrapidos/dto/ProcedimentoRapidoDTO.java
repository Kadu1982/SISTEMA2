package com.sistemadesaude.backend.procedimentosrapidos.dto;

import com.sistemadesaude.backend.procedimentosrapidos.enums.StatusProcedimento;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcedimentoRapidoDTO {

    private Long id;

    // Dados do paciente
    private Long pacienteId;
    private String pacienteNome;
    private Integer pacienteIdade;
    private String pacienteCpf;

    // Operador responsável
    private Long operadorResponsavelId;
    private String operadorResponsavelNome;

    private StatusProcedimento status;
    private String origemEncaminhamento;
    private Long atendimentoMedicoOrigemId;
    private String medicoSolicitante;
    private String especialidadeOrigem;

    @Builder.Default
    private List<AtividadeEnfermagemDTO> atividades = new ArrayList<>();

    private DesfechoDTO desfecho;

    private String alergias;
    private String observacoesGerais;

    // Bloqueio
    private Long bloqueadoPorOperadorId;
    private String bloqueadoPorOperadorNome;
    private LocalDateTime bloqueadoEm;

    // Timestamps do atendimento
    private LocalDateTime dataHoraInicioAtendimento;
    private LocalDateTime dataHoraFimAtendimento;

    // Cancelamento
    private String canceladoPor;
    private String motivoCancelamento;
    private LocalDateTime dataCancelamento;

    // Auditoria
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAtualizacao;
    private String criadoPor;
    private String atualizadoPor;

    // Campos calculados
    private Boolean bloqueado;
    private Boolean temAtividadesPendentes;
    private Long quantidadeAtividadesPendentes;
}
