package com.sistemadesaude.backend.samu.dto;

import com.sistemadesaude.backend.samu.enums.StatusOcorrencia;
import com.sistemadesaude.backend.samu.enums.TipoOcorrencia;
import com.sistemadesaude.backend.samu.enums.PrioridadeOcorrencia;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OcorrenciaDetalhadaDTO {

    private Long id;
    private String numeroOcorrencia;
    private TipoOcorrencia tipoOcorrencia;
    private StatusOcorrencia status;
    private PrioridadeOcorrencia prioridade;

    private String telefoneSolicitante;
    private String nomeSolicitante;
    private String enderecoCompleto;
    private Double latitude;
    private Double longitude;

    private String descricaoOcorrencia;
    private String queixaPrincipal;
    private String observacoes;

    private CentralRegulacaoDTO centralRegulacao;
    private OperadorResumoDTO operador;
    private OperadorResumoDTO medicoRegulador;

    private List<PacienteOcorrenciaDTO> pacientes;
    private List<ViaturaOcorrenciaDTO> viaturas;
    private List<EventoOcorrenciaDTO> eventos;

    private LocalDateTime dataAbertura;
    private LocalDateTime dataEncerramento;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAtualizacao;

    private String tempoDecorrido;
    private String statusFormatado;
    private String prioridadeFormatada;
}
