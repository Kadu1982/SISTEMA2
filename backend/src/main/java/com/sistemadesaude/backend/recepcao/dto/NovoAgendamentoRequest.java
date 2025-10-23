package com.sistemadesaude.backend.recepcao.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;

/**
 * DTO para receber os dados de um novo agendamento vindo do frontend.
 */
@Data
public class NovoAgendamentoRequest {
    private Long pacienteId;
    private String tipo;
    private String dataHora;
    private String observacoes;

    // Campo transiente para armazenar o LocalDateTime convertido
    private transient LocalDateTime dataHoraConvertida;

    // ✅ NOVOS CAMPOS ADICIONADOS
    private String especialidade;
    private String prioridade;
    private String unidade;
    private List<String> examesSelecionados;

    /**
     * Converte a string dataHora para LocalDateTime
     * @return LocalDateTime convertido da string dataHora
     * @throws DateTimeParseException se a string não estiver em um formato válido
     */
    public LocalDateTime getDataHoraConvertida() {
        if (dataHoraConvertida == null && dataHora != null && !dataHora.isEmpty()) {
            try {
                // Tenta ISO format (2023-01-01T10:00:00)
                dataHoraConvertida = LocalDateTime.parse(dataHora);
            } catch (DateTimeParseException e) {
                try {
                    // Tenta formato com milissegundos (2023-01-01T10:00:00.000Z)
                    dataHoraConvertida = LocalDateTime.parse(dataHora, DateTimeFormatter.ISO_DATE_TIME);
                } catch (DateTimeParseException e2) {
                    // Formato personalizado como último recurso
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
                    dataHoraConvertida = LocalDateTime.parse(dataHora, formatter);
                }
            }
        }
        return dataHoraConvertida;
    }
}
