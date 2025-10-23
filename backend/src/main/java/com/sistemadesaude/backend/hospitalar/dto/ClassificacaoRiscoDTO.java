package com.sistemadesaude.backend.hospitalar.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassificacaoRiscoDTO {

    private Long id;

    @NotNull(message = "ID do paciente é obrigatório")
    private Long pacienteId;

    private Long atendimentoId;

    @NotNull(message = "Protocolo utilizado é obrigatório")
    private String protocoloUtilizado;

    @Size(max = 500, message = "Queixa principal não pode exceder 500 caracteres")
    private String queixaPrincipal;

    @Size(max = 1000, message = "Observações de abordagem não podem exceder 1000 caracteres")
    private String observacoesAbordagem;

    @Size(max = 1000, message = "Medicamentos em uso não podem exceder 1000 caracteres")
    private String medicamentosUso;

    @Size(max = 500, message = "Alergias não podem exceder 500 caracteres")
    private String alergias;

    @Size(max = 500, message = "Reações alérgicas não podem exceder 500 caracteres")
    private String reacoesAlergicas;

    private String sinaisVitais; // JSON string

    @Size(max = 200, message = "Sintoma principal não pode exceder 200 caracteres")
    private String sintomaPrincipal;

    @Min(value = 3, message = "Escala de Glasgow deve ser entre 3 e 15")
    @Max(value = 15, message = "Escala de Glasgow deve ser entre 3 e 15")
    private Integer avaliacaoGlasgow;

    @Min(value = 0, message = "Escala de dor deve ser entre 0 e 10")
    @Max(value = 10, message = "Escala de dor deve ser entre 0 e 10")
    private Integer escalaDor;

    @NotNull(message = "Cor de prioridade é obrigatória")
    private String corPrioridade;

    private Integer tempoMaxEspera;

    @Size(max = 100, message = "Especialidade sugerida não pode exceder 100 caracteres")
    private String especialidadeSugerida;

    private Boolean riscoSepse = false;

    private LocalDateTime dataClassificacao;

    @NotNull(message = "ID do operador é obrigatório")
    private Long operadorId;

    private String nomeOperador;

    private Boolean reavaliacao = false;

    private Long classificacaoAnteriorId;

    private Boolean encaminhamentoSocial = false;

    @Size(max = 1000, message = "Observações gerais não podem exceder 1000 caracteres")
    private String observacoesGerais;

    // Campos auxiliares para exibição
    private String nomePaciente;
    private String cpfPaciente;
    private String protocoloDescricao;
    private String corPrioridadeDescricao;
    private String tempoEsperaFormatado;
}