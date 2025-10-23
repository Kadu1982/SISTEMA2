package com.sistemadesaude.backend.samu.dto;

import com.sistemadesaude.backend.samu.enums.TipoOcorrencia;
import com.sistemadesaude.backend.samu.enums.PrioridadeOcorrencia;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CriarOcorrenciaDTO {

    @NotNull(message = "Tipo de ocorrência é obrigatório")
    private TipoOcorrencia tipoOcorrencia;

    @NotBlank(message = "Telefone do solicitante é obrigatório")
    private String telefoneSolicitante;

    private String nomeSolicitante;

    @NotBlank(message = "Endereço é obrigatório")
    private String enderecoCompleto;

    private Double latitude;
    private Double longitude;

    @NotBlank(message = "Descrição da ocorrência é obrigatória")
    private String descricaoOcorrencia;

    private String queixaPrincipal;

    @NotNull(message = "Central de regulação é obrigatória")
    private Long centralRegulacaoId;

    @NotNull(message = "Prioridade é obrigatória")
    private PrioridadeOcorrencia prioridade;

    private String observacoes;

    private List<PacienteOcorrenciaDTO> pacientes;
}
