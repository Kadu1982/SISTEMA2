package com.sistemadesaude.backend.upa.dto;

import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO para fila de aguardando triagem UPA
 */
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AguardandoTriagemDTO {
    private Long upaId;
    private Long pacienteId;
    private String pacienteNome;
    private LocalDateTime dataHoraRegistro;
    private String prioridade; // pode ser null inicialmente
}
