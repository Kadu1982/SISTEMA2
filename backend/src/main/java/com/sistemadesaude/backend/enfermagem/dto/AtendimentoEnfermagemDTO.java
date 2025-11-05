package com.sistemadesaude.backend.enfermagem.dto;

import com.sistemadesaude.backend.enfermagem.entity.AtendimentoEnfermagem.OrigemAtendimento;
import com.sistemadesaude.backend.enfermagem.entity.AtendimentoEnfermagem.Prioridade;
import com.sistemadesaude.backend.enfermagem.entity.AtendimentoEnfermagem.StatusAtendimento;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO para Atendimento de Enfermagem.
 * Representa dados de atendimentos rápidos de enfermagem vindos do Ambulatorial ou UPA.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtendimentoEnfermagemDTO {

    private Long id;

    @NotNull(message = "Paciente é obrigatório")
    private Long pacienteId;
    private String pacienteNome;
    private String pacienteCpf;

    @NotNull(message = "Unidade de saúde é obrigatória")
    private Long unidadeId;
    private String unidadeNome;

    private Long enfermeiroId;
    private String enfermeiroNome;

    @NotNull(message = "Origem do atendimento é obrigatória")
    private OrigemAtendimento origemAtendimento;

    private Long origemId; // ID do atendimento original (Ambulatorial ou UPA)

    @NotNull(message = "Prioridade é obrigatória")
    private Prioridade prioridade;

    @NotNull(message = "Status é obrigatório")
    private StatusAtendimento status;

    // Sinais vitais
    private String pressaoArterial; // Ex: "120/80"

    @Min(value = 30, message = "Frequência cardíaca deve ser maior que 30")
    @Max(value = 250, message = "Frequência cardíaca deve ser menor que 250")
    private Integer frequenciaCardiaca;

    @Min(value = 8, message = "Frequência respiratória deve ser maior que 8")
    @Max(value = 60, message = "Frequência respiratória deve ser menor que 60")
    private Integer frequenciaRespiratoria;

    @Min(value = 30, message = "Temperatura deve ser maior que 30°C")
    @Max(value = 45, message = "Temperatura deve ser menor que 45°C")
    private Double temperatura;

    @Min(value = 0, message = "Saturação deve ser maior que 0%")
    @Max(value = 100, message = "Saturação deve ser menor ou igual a 100%")
    private Integer saturacaoO2;

    @Min(value = 0, message = "Glicemia deve ser maior ou igual a 0")
    @Max(value = 600, message = "Glicemia deve ser menor que 600 mg/dL")
    private Integer glicemia;

    @Min(value = 0, message = "Escala de dor deve ser entre 0 e 10")
    @Max(value = 10, message = "Escala de dor deve ser entre 0 e 10")
    private Integer escalaDor;

    // Informações adicionais
    private String queixaPrincipal;
    private String observacoes;
    private String condicoesGerais;

    // Datas
    private LocalDateTime dataHoraInicio;
    private LocalDateTime dataHoraFim;

    // Procedimentos realizados
    private List<ProcedimentoEnfermagemDTO> procedimentos;

    // Auditoria
    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;
    private String criadoPor;
    private String atualizadoPor;
}
