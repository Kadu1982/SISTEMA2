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
public class EventoOcorrenciaDTO {

    private Long id;
    private String tipoEvento;
    private String descricaoEvento;
    private LocalDateTime dataHoraEvento;

    // Responsável pelo evento
    private Long operadorId;
    private String operadorNome;
    private String operadorFuncao;

    // Detalhes do evento
    private String categoria; // SISTEMA, OPERACIONAL, CLINICO, ADMINISTRATIVO
    private String prioridade; // BAIXA, MEDIA, ALTA, CRITICA
    private String status; // PENDENTE, EM_ANDAMENTO, CONCLUIDO, CANCELADO

    // Localização do evento (se aplicável)
    private Double latitude;
    private Double longitude;
    private String endereco;

    // Recursos envolvidos
    private Long viaturaId;
    private String viaturacodigo;
    private Long pacienteId;
    private String pacienteNome;

    // Dados técnicos
    private String protocolo;
    private String procedimento;
    private String medicamento;
    private String equipamento;
    private String dosagem;

    // Resultados e observações
    private String resultado;
    private String observacoes;
    private String proximaAcao;
    private LocalDateTime prazoExecucao;

    // Validação e auditoria
    private Boolean validado;
    private Long validadoPorOperadorId;
    private String validadoPorOperadorNome;
    private LocalDateTime dataValidacao;
    private String motivoValidacao;

    // Anexos e evidências
    private String anexos;
    private String fotosAntes;
    private String fotosDepois;
    private String audioDescricao;

    // Integração com outros sistemas
    private String sistemaOrigem;
    private String referenciaExterna;
    private Boolean sincronizado;

    // Classificação para relatórios
    private String classificacaoEstatistica;
    private String impactoOperacional;
    private Boolean eventoSentinela;
    private String indicadorQualidade;
}
