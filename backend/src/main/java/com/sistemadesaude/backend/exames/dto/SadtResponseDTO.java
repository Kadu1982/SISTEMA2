package com.sistemadesaude.backend.exames.dto;

import com.sistemadesaude.backend.exames.dto.SadtDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SadtResponseDTO {
    private String numeroSadt;
    private String pdfBase64;
    private SadtDTO sadtData;
    private LocalDateTime dataGeracao;
    private Boolean sucesso;
    private String mensagem;
    private String operador;
}
