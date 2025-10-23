package com.sistemadesaude.backend.recepcao.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * DTO para retornar dados do agendamento para o frontend
 */
@Data
public class AgendamentoDTO {
    private Long id;
    private Long pacienteId;
    private String pacienteNome;

    @JsonIgnore
    private LocalDateTime pacienteDataNascimento;

    private String profissionalNome;

    @JsonIgnore
    private LocalDateTime dataHora;

    // ✅ CAMPO FALTANTE ADICIONADO
    @JsonIgnore
    private LocalDateTime dataAgendamento;

    private String status;
    private String tipo;

    // Métodos para serializar datas como strings para o frontend
    @JsonProperty("pacienteDataNascimento")
    public String getPacienteDataNascimentoFormatado() {
        return pacienteDataNascimento != null ?
                pacienteDataNascimento.format(DateTimeFormatter.ISO_DATE) : null;
    }

    @JsonProperty("dataHora")
    public String getDataHoraFormatada() {
        return dataHora != null ?
                dataHora.format(DateTimeFormatter.ISO_DATE_TIME) : null;
    }

    // ✅ MÉTODO PARA SERIALIZAR DATA DE AGENDAMENTO
    @JsonProperty("dataAgendamento")
    public String getDataAgendamentoFormatada() {
        return dataAgendamento != null ?
                dataAgendamento.format(DateTimeFormatter.ISO_DATE_TIME) : null;
    }

    // CAMPOS EXISTENTES
    private String especialidade;
    private String prioridade;
    private String unidade;
    private String observacoes;
    private List<String> examesSelecionados;
    private Boolean precisaSadt;
    private Boolean temSadt;

    // ✅ CAMPO ADICIONADO PARA PDF
    private String comprovantePdfBase64;

    // ✅ CONSTRUTOR PRINCIPAL ATUALIZADO
    public AgendamentoDTO(Long id, Long pacienteId, String pacienteNome, LocalDateTime pacienteDataNascimento,
                          String profissionalNome, LocalDateTime dataHora, LocalDateTime dataAgendamento,
                          String status, String tipo) {
        this.id = id;
        this.pacienteId = pacienteId;
        this.pacienteNome = pacienteNome;
        this.pacienteDataNascimento = pacienteDataNascimento;
        this.profissionalNome = profissionalNome;
        this.dataHora = dataHora;
        this.dataAgendamento = dataAgendamento;
        this.status = status;
        this.tipo = tipo;
    }

    // Construtor sem data de nascimento (para compatibilidade)
    public AgendamentoDTO(Long id, Long pacienteId, String pacienteNome, String profissionalNome,
                          LocalDateTime dataHora, String status, String tipo) {
        this.id = id;
        this.pacienteId = pacienteId;
        this.pacienteNome = pacienteNome;
        this.profissionalNome = profissionalNome;
        this.dataHora = dataHora;
        this.status = status;
        this.tipo = tipo;
    }

    // Construtor para compatibilidade com código existente
    public AgendamentoDTO(Long id, String pacienteNome, LocalDateTime pacienteDataNascimento, String profissionalNome,
                          LocalDateTime dataHora, String status, String tipo) {
        this.id = id;
        this.pacienteNome = pacienteNome;
        this.pacienteDataNascimento = pacienteDataNascimento;
        this.profissionalNome = profissionalNome;
        this.dataHora = dataHora;
        this.status = status;
        this.tipo = tipo;
    }

    // Construtor sem data de nascimento e sem pacienteId (para compatibilidade)
    public AgendamentoDTO(Long id, String pacienteNome, String profissionalNome,
                          LocalDateTime dataHora, String status, String tipo) {
        this.id = id;
        this.pacienteNome = pacienteNome;
        this.profissionalNome = profissionalNome;
        this.dataHora = dataHora;
        this.status = status;
        this.tipo = tipo;
    }

    // Construtor vazio
    public AgendamentoDTO() {}

    public String getOperadorNome() {
        return null;
    }
}
