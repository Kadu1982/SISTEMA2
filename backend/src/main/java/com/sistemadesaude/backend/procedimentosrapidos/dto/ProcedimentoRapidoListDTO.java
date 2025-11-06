package com.sistemadesaude.backend.procedimentosrapidos.dto;

import com.sistemadesaude.backend.procedimentosrapidos.enums.StatusProcedimento;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO simplificado para listagem de Procedimentos Rápidos
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcedimentoRapidoListDTO {

    private Long id;
    private String pacienteNome;
    private Integer pacienteIdade;
    private StatusProcedimento status;
    private String medicoSolicitante;
    private String origemEncaminhamento;
    private Long quantidadeAtividadesPendentes;
    private Long quantidadeAtividadesTotal;
    private Boolean temAtividadesUrgentes;
    private Boolean temAtividadesAtrasadas;
    private String operadorResponsavelNome;
    private Boolean bloqueado;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataHoraInicioAtendimento;
}
