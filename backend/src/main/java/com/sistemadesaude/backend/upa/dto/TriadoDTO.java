package com.sistemadesaude.backend.upa.dto;

import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO para pacientes já triados (aguardando atendimento médico)
 */
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TriadoDTO {
    private Long triagemId;
    private Long upaId;
    private Long pacienteId;
    private String pacienteNome;
    private LocalDateTime criadoEm;
    private String classificacaoRisco;
}
