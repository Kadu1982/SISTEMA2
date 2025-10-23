package com.sistemadesaude.backend.exames.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ColetaMaterialDTO {
    private Long id;
    private Long recepcaoId;
    private String numeroRecepcao;
    private String pacienteNome;
    private LocalDateTime dataColeta;
    private String operadorColeta;
    private String observacoes;
    private List<MaterialColetadoDTO> materiaisColetados;
}