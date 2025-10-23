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
public class ResultadoExameDTO {
    private Long id;
    private Long exameRecepcaoId;
    private String numeroRecepcao;
    private String pacienteNome;
    private String exameNome;
    private Long metodoId;
    private String metodoNome;
    private LocalDateTime dataResultado;
    private String operadorDigitacao;

    // Resultado textual
    private String resultadoTexto;

    // Campos dinâmicos
    private List<ValorCampoResultadoDTO> valoresCampos;

    // Laudo
    private String laudoGerado;
    private Boolean laudoLiberado;
    private LocalDateTime dataLiberacao;

    // Assinatura
    private Boolean assinado;
    private String profissionalAssinatura;
    private LocalDateTime dataAssinatura;

    // Impressão
    private Boolean impresso;
    private LocalDateTime dataImpressao;
    private Integer quantidadeImpressoes;

    // Interfaceamento
    private Boolean importadoEquipamento;
    private LocalDateTime dataImportacao;

    private String observacoes;
}