package com.sistemadesaude.backend.hospitalar.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FilaAtendimentoDTO {

    private Long id;

    @NotBlank(message = "Nome da fila é obrigatório")
    private String nome;

    private String descricao;

    @NotBlank(message = "Prefixo da senha é obrigatório")
    private String prefixoSenha;

    private LocalTime horarioInicio;

    private LocalTime horarioFim;

    private Boolean ativo;

    private Long unidadeId;

    private String nomeUnidade;

    private Long setorId;

    private String nomeSetor;

    // Estatísticas
    private Integer senhasAguardando = 0;

    private Integer tempoMedio = 0;

    private Integer atendimentosHoje = 0;

    // Campos de auditoria para exibição
    private String dataCreated;

    private String dataUpdated;
}