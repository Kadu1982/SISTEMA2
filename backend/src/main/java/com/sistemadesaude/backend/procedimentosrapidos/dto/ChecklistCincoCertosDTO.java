package com.sistemadesaude.backend.procedimentosrapidos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO para Checklist dos 5 Certos
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChecklistCincoCertosDTO {

    private Long id;
    private Long atividadeEnfermagemId;
    private Boolean pacienteCerto;
    private Boolean medicamentoCerto;
    private Boolean doseCerta;
    private Boolean viaCerta;
    private Boolean horarioCerto;
    private LocalDateTime dataValidacao;
    
    /**
     * Indica se o checklist está completo (todos TRUE)
     */
    private boolean completo;
    
    /**
     * Lista de campos não validados
     */
    private List<String> camposNaoValidados;
}
