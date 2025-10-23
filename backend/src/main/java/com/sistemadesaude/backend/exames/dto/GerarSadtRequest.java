package com.sistemadesaude.backend.exames.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class GerarSadtRequest {

    @NotNull(message = "ID do recepcao é obrigatório")
    private Long agendamentoId;

    // ✅ NOVO CAMPO ADICIONADO
    @NotNull(message = "ID do paciente é obrigatório")
    private Long pacienteId;

    @NotEmpty(message = "Lista de procedimentos não pode estar vazia")
    private List<ProcedimentoRequest> procedimentos;

    private String observacoes;

    @Builder.Default
    private Boolean urgente = false;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class ProcedimentoRequest {

        @NotBlank(message = "Código do procedimento é obrigatório")
        private String codigo;

        @NotBlank(message = "Nome do procedimento é obrigatório")
        private String nome;

        @NotNull(message = "Quantidade é obrigatória")
        @Min(value = 1, message = "Quantidade deve ser maior que zero")
        private Integer quantidade;

        private String cid10;
        private String justificativa;
        private String preparo;
    }
}
