package com.sistemadesaude.backend.samu.dto;

import com.sistemadesaude.backend.samu.enums.StatusOcorrencia;
import com.sistemadesaude.backend.samu.enums.TipoOcorrencia;
import com.sistemadesaude.backend.samu.enums.PrioridadeOcorrencia;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * 🚑 DTO RESUMIDO PARA LISTAGENS DE OCORRÊNCIAS
 *
 * Usado em dashboards, listas e relatórios onde não é necessário
 * carregar todos os detalhes da ocorrência.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumoOcorrenciaDTO {

    private Long id;
    private String numeroOcorrencia;
    private TipoOcorrencia tipoOcorrencia;
    private StatusOcorrencia status;
    private PrioridadeOcorrencia prioridade;

    private String telefoneSolicitante;
    private String nomeSolicitante;
    private String enderecoResumido;
    private String queixaPrincipal;

    private String centralRegulacaoNome;
    private String operadorNome;
    private String medicoReguladorNome;

    private Integer quantidadePacientes;
    private Integer quantidadeViaturas;
    private String viaturasPrincipais;

    private LocalDateTime dataAbertura;
    private LocalDateTime dataEncerramento;

    // Campos calculados
    private String tempoDecorrido;
    private String statusFormatado;
    private String prioridadeFormatada;
    private String tipoFormatado;

    // Indicadores visuais
    private String corPrioridade;
    private String iconeStatus;
    private Boolean requerAtencao;
    private Boolean emAtraso;
}
