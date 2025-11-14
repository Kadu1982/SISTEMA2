package com.sistemadesaude.backend.prescricao.dto;

import com.sistemadesaude.backend.prescricao.entity.PrescricaoMedicamento;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO para PrescricaoMedicamento
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescricaoMedicamentoDTO {
    private Long id;
    private Long atendimentoId;
    private PrescricaoMedicamento.TipoPrescricao tipoPrescricao;
    private String medicamentoCodigo;
    private String medicamentoNome;
    private Long principioAtivoId;
    private String principioAtivo;
    private Integer numeroReceita;
    private Boolean medicamentoControlado;
    private BigDecimal quantidade;
    private String unidade;
    private String viaAdministracao;
    private LocalDateTime dataHoraInicial;
    private LocalDateTime dataHoraFinal;
    private Integer duracaoDias;
    private String aprazamento;
    private String instrucaoDosagem;
    private String observacoes;
    private Integer ordem;
    private Boolean ativo;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAtualizacao;
}

