package com.sistemadesaude.backend.upa.dto;

import com.sistemadesaude.backend.upa.enums.UpaStatus;
import com.sistemadesaude.backend.upa.enums.UpaPrioridade;
import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO para transferência de dados da UPA
 */
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UpaDTO {
    private Long id;
    private Long pacienteId;
    private String pacienteNome; // para exibição
    private LocalDateTime dataHoraRegistro;
    private String dataEntrada; // YYYY-MM-DD
    private String horaEntrada; // HH:mm
    private UpaPrioridade prioridade;
    private String motivo;
    private UpaStatus status;
    private String observacoes;
    private Long unidadeId;
    private LocalDateTime atualizadoEm;
    private Boolean ativo;
}
