package com.sistemadesaude.backend.recepcao.dto;

import com.sistemadesaude.backend.recepcao.entity.BloqueioHorario;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BloqueioHorarioDTO {
    private Long id;
    private Long profissionalId;
    private String profissionalNome;
    private Long salaId;
    private String salaNome;
    private Long unidadeId;
    private String unidadeNome;
    private BloqueioHorario.TipoBloqueio tipoBloqueio;
    private String tipoBloqueioTexto;
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private LocalTime horaInicio;
    private LocalTime horaFim;
    private Boolean diaInteiro;
    private String motivo;
    private Boolean ativo;
    private Long operadorBloqueioId;
    private String operadorBloqueioNome;
}