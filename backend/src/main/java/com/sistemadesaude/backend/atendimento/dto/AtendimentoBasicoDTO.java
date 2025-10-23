package com.sistemadesaude.backend.atendimento.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 📋 DTO BÁSICO PARA LISTAGENS DE ATENDIMENTO
 *
 * ✅ SOLUÇÃO: DTO separado para evitar ambiguidade
 * ✅ OTIMIZADO: Apenas campos essenciais para performance
 * ✅ CORRIGIDO: Adicionado motivoDesfecho para evitar erro de mapeamento
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtendimentoBasicoDTO {

    private String id;
    private String pacienteId;
    private String profissionalId;
    private String cid10;
    private String diagnostico;
    private String statusAtendimento;
    private LocalDateTime dataHora;
    private LocalDateTime dataAtualizacao;
    private Boolean ativo;

    // ✅ ADICIONADO: Campo necessário para o mapper
    private String motivoDesfecho;

    // ✅ CAMPOS ESSENCIAIS PARA LISTAGEM APENAS
    // Não inclui: observacoes, prescricao, examesFisicos, etc.
}