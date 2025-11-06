package com.sistemadesaude.backend.procedimentosrapidos.dto;

import com.sistemadesaude.backend.procedimentosrapidos.enums.TipoDesfecho;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DesfechoDTO {

    private TipoDesfecho tipo;
    private String setorDestino;
    private String especialidade;
    private String procedimentoSolicitado;
    private LocalDateTime dataAgendadaReavaliacao;
    private String observacoes;
    private LocalDateTime dataRegistro;
    private String profissionalResponsavel;
}
