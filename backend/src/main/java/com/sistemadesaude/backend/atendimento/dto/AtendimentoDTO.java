package com.sistemadesaude.backend.atendimento.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 📋 DTO PARA TRANSFERÊNCIA DE DADOS DE ATENDIMENTO
 *
 * ✅ ATUALIZADO: Adicionado motivo de desfecho e especialidade de encaminhamento
 * ✅ ATUALIZADO: Validações completas
 * ✅ CORREÇÃO: Campos obrigatórios marcados
 * ✅ MELHORIA: Documentação completa
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtendimentoDTO {

    private Long id;

    @NotBlank(message = "PacienteId é obrigatório")
    private String pacienteId;

    @NotBlank(message = "CID10 é obrigatório")
    private String cid10;

    private String diagnostico;
    private String prescricao;
    private String observacoes;
    private String examesFisicos;
    private String sintomas;
    private String medicamentosPrescritos;
    private String orientacoes;

    // ✅ REMOVIDO: Campo retorno (substituído por motivo de desfecho)
    // private String retorno;

    // ✅ ADICIONADO: Motivo de desfecho baseado na tabela oficial
    private String motivoDesfecho; // Códigos: 01, 02, 03, 04, 05, 06, 07, 08, 09, 99

    // ✅ ADICIONADO: Especialidade para encaminhamento (quando motivo = 03)
    private String especialidadeEncaminhamento;

    @Builder.Default
    private LocalDateTime dataHora = LocalDateTime.now();

    private LocalDateTime dataAtualizacao;
    private String profissionalId;
    private String statusAtendimento;

    // Campos para relatórios e controle
    private Boolean ativo;
    private String observacoesInternas;

    // Campo para compatibilidade com a queixa principal
    private String queixaPrincipal;

    // Campo para identificar o tipo de atendimento (AMBULATORIAL, UPA, etc.)
    private String tipoAtendimento;

    // Campo retorno (mantido para compatibilidade com atendimentos UPA)
    private String retorno;

    /**
     * Verifica se o motivo de desfecho é encaminhamento
     */
    public boolean isEncaminhamento() {
        return "03".equals(motivoDesfecho);
    }

    /**
     * Obtém a descrição do motivo de desfecho
     */
    public String getMotivoDesfechoDescricao() {
        if (motivoDesfecho == null) return null;

        return switch (motivoDesfecho) {
            case "01" -> "Alta Clínica";
            case "02" -> "Alta voluntária";
            case "03" -> "Encaminhamento";
            case "04" -> "Evasão";
            case "05" -> "Ordem judicial";
            case "06" -> "Óbito";
            case "07" -> "Permanência";
            case "08" -> "Retorno";
            case "09" -> "Transferência";
            case "99" -> "Sem registro no modelo de informação de origem";
            default -> "Código inválido: " + motivoDesfecho;
        };
    }

    /**
     * Obtém a especialidade formatada para exibição
     */
    public String getEspecialidadeFormatada() {
        if (especialidadeEncaminhamento == null || especialidadeEncaminhamento.trim().isEmpty()) {
            return "GERAL";
        }
        return especialidadeEncaminhamento.replace("_", " ").toLowerCase();
    }
}