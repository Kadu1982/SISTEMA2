package com.sistemadesaude.backend.samu.dto;

import com.sistemadesaude.backend.samu.enums.StatusOcorrencia;
import com.sistemadesaude.backend.samu.enums.PrioridadeOcorrencia;
import com.sistemadesaude.backend.samu.enums.RiscoPresumido;
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
public class OcorrenciaRegulacaoDTO {

    private Long id;
    private String numeroOcorrencia;
    private StatusOcorrencia status;
    private PrioridadeOcorrencia prioridade;
    private String descricaoOcorrencia;
    private String enderecoCompleto;
    private LocalDateTime dataAbertura;
    private String medicoReguladorNome;
    private String centralRegulacaoNome;

    // Dados do solicitante
    private String nomeSolicitante;
    private String telefoneSolicitante;

    // Pacientes
    private List<PacienteRegulacaoDTO> pacientes;

    // Estatísticas/indicadores
    private Long tempoAguardandoMinutos;
    private RiscoPresumido riscoMaximo;
    private Integer quantidadePacientes;
    private Boolean possuiMedico;
    private Boolean possuiEnfermeiro;

    // Dados de localização
    private Double latitude;
    private Double longitude;

    private String observacoes;
}
