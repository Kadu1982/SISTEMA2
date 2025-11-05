package com.sistemadesaude.backend.enfermagem.dto;

import com.sistemadesaude.backend.enfermagem.entity.ProcedimentoEnfermagem.StatusProcedimento;
import com.sistemadesaude.backend.enfermagem.entity.ProcedimentoEnfermagem.TipoProcedimento;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * DTO para Procedimento de Enfermagem.
 * Representa procedimentos rápidos realizados no atendimento de enfermagem.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcedimentoEnfermagemDTO {

    private Long id;

    @NotNull(message = "Atendimento é obrigatório")
    private Long atendimentoId;

    @NotNull(message = "Tipo de procedimento é obrigatório")
    private TipoProcedimento tipoProcedimento;

    @NotBlank(message = "Descrição é obrigatória")
    private String descricao;

    @NotNull(message = "Status é obrigatório")
    private StatusProcedimento status;

    // Campos específicos para medicação
    private String medicamentoNome;
    private String medicamentoDose;
    private String medicamentoVia;
    private String medicamentoLote;
    private LocalDateTime medicamentoDataAplicacao;

    // Campos específicos para curativos
    private String curativoLocalizacao;
    private String curativoTipo;
    private String curativoMaterialUtilizado;
    private String curativoAspecto;

    // Campos específicos para suturas
    private String suturaLocalizacao;
    private Integer suturaNumeroPontos;
    private String suturaFioTipo;
    private String suturaTecnica;

    // Campos específicos para nebulização
    private String nebulizacaoMedicamento;
    private String nebulizacaoDose;
    private Integer nebulizacaoTempo; // em minutos

    // Campos específicos para oxigenioterapia
    private Integer oxigenioFluxo; // litros por minuto
    private String oxigenioDispositivo; // cateter nasal, máscara, etc.

    // Campos específicos para sondagem
    private String sondagemTipo;
    private String sondagemNumero;
    private String sondagemFixacao;

    // Campos gerais
    private String observacoes;
    private String complicacoes;

    private Long executorId;
    private String executorNome;

    private LocalDateTime dataHoraInicio;
    private LocalDateTime dataHoraFim;

    // Auditoria
    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;
    private String criadoPor;
    private String atualizadoPor;
}
