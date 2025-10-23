package com.sistemadesaude.backend.operador.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HorarioAcessoDTO {
    private Long id;
    private Long operadorId;
    private Short diaSemana; // 0..6
    private String horaInicio; // "HH:mm"
    private String horaFim;    // "HH:mm"
    private Boolean ativo;
}
