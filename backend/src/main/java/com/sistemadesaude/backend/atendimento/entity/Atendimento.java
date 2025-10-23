package com.sistemadesaude.backend.atendimento.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Getter;
import lombok.Setter;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

/**
 * 🏥 ENTIDADE DE ATENDIMENTO
 *
 * ✅ ATUALIZADO: Adicionado motivo de desfecho e especialidade de encaminhamento
 * ✅ CORRIGIDO: Campos CIAP-2 incluídos
 * ✅ CORREÇÃO: Soft-delete padronizado
 * ✅ NOVA FUNCIONALIDADE: Validações e métodos utilitários
 */
@Data
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "atendimentos")
public class Atendimento {

    // ========================================
    // 🔑 Identificação
    // ========================================
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "paciente_id", nullable = false)
    private Long pacienteId;

    @Column(name = "profissional_id", nullable = false)
    private Long profissionalId;

    @Column(name = "unidade_id")
    private Long unidadeId;

    @Column(name = "setor_id")
    private Long setorId;

    // ========================================
    // 🕒 Datas e status
    // ========================================
    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;

    @Column(name = "status", length = 40, nullable = false)
    private String statusAtendimento;

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "data_atualizacao", nullable = false)
    private LocalDateTime dataAtualizacao;

    @Column(name = "ativo", nullable = false)
    @Default
    private Boolean ativo = Boolean.TRUE;

    // ========================================
    // 📝 Dados clínicos
    // ========================================
    @Column(name = "queixa_principal", columnDefinition = "TEXT")
    private String queixaPrincipal;

    @Column(name = "diagnostico", columnDefinition = "TEXT")
    private String diagnostico;

    @Column(name = "sintomas", columnDefinition = "TEXT")
    private String sintomas;

    @Column(name = "exames_fisicos", columnDefinition = "TEXT")
    private String examesFisicos;

    @Column(name = "prescricao", columnDefinition = "TEXT")
    private String prescricao;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "medicamentos_prescritos", columnDefinition = "TEXT")
    private String medicamentosPrescritos;

    @Column(name = "orientacoes", columnDefinition = "TEXT")
    private String orientacoes;

    @Column(name = "observacoes_internas", columnDefinition = "TEXT")
    private String observacoesInternas;

    // ========================================
    // ✅ NOVO: MOTIVO DE DESFECHO
    // ========================================

    /**
     * Motivo de desfecho baseado na tabela oficial
     * Valores possíveis: 01, 02, 03, 04, 05, 06, 07, 08, 09, 99
     */
    @Column(name = "motivo_desfecho", length = 2)
    private String motivoDesfecho;

    /**
     * Especialidade para encaminhamento (quando motivo_desfecho = '03')
     */
    @Column(name = "especialidade_encaminhamento", length = 100)
    private String especialidadeEncaminhamento;

    // ========================================
    // 📚 CIAP-2
    // ========================================

    /**
     * CID-10 (mantido para compatibilidade)
     */
    @Column(name = "cid10", length = 10)
    private String cid10;

    /**
     * RFE (Reason For Encounter) – faixa 01–29.
     */
    @Column(name = "ciap_rfe", length = 3)
    private String ciapRfe;

    /**
     * Diagnósticos/Problemas – faixa 70–99.
     */
    @ElementCollection
    @CollectionTable(
            name = "atendimento_ciap_diag",
            joinColumns = @JoinColumn(name = "atendimento_id")
    )
    @Column(name = "codigo", length = 3, nullable = false)
    private Set<String> ciapDiagnosticos = new LinkedHashSet<>();

    /**
     * Processos/Procedimentos – faixa 30–69.
     */
    @ElementCollection
    @CollectionTable(
            name = "atendimento_ciap_proc",
            joinColumns = @JoinColumn(name = "atendimento_id")
    )
    @Column(name = "codigo", length = 3, nullable = false)
    private Set<String> ciapProcedimentos = new LinkedHashSet<>();

    // ========================================
    // 🔐 Controle de ativação (soft delete)
    // ========================================

    public boolean isAtivo() {
        return Boolean.TRUE.equals(this.ativo);
    }

    public void ativar() {
        this.ativo = Boolean.TRUE;
        this.dataAtualizacao = LocalDateTime.now();
    }

    public void inativar() {
        this.ativo = Boolean.FALSE;
        this.dataAtualizacao = LocalDateTime.now();
    }

    // ========================================
    // 🧭 Métodos de domínio
    // ========================================

    public void finalizar() {
        this.statusAtendimento = "FINALIZADO";
        this.dataAtualizacao = LocalDateTime.now();
    }

    public void iniciar() {
        this.statusAtendimento = "EM_ATENDIMENTO";
        this.dataAtualizacao = LocalDateTime.now();
    }

    /**
     * Verifica se o atendimento é um encaminhamento
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
     * Obtém a especialidade formatada
     */
    public String getEspecialidadeFormatada() {
        if (especialidadeEncaminhamento == null || especialidadeEncaminhamento.trim().isEmpty()) {
            return "GERAL";
        }
        return especialidadeEncaminhamento.replace("_", " ");
    }

    public String resumo() {
        return "Atendimento{id=%s, paciente=%s, data=%s, motivo=%s}".formatted(
                id, pacienteId, dataHora, getMotivoDesfechoDescricao());
    }

    // ========================================
    // ⚙️ Callbacks
    // ========================================
    @PrePersist
    public void prePersist() {
        var agora = LocalDateTime.now();
        if (dataHora == null) dataHora = agora;
        dataCriacao = agora;
        dataAtualizacao = agora;
        if (statusAtendimento == null) statusAtendimento = "EM_ATENDIMENTO";
        if (ativo == null) ativo = Boolean.TRUE;
    }

    @PreUpdate
    public void preUpdate() {
        dataAtualizacao = LocalDateTime.now();
        if (ativo == null) ativo = Boolean.TRUE;
    }
}