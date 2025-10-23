package com.sistemadesaude.backend.assistenciasocial.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * ✅ ENTIDADE: Tipo de Encaminhamento da Assistência Social
 *
 * 🔧 CORREÇÃO APLICADA:
 * - Adicionado @Entity(name = "TipoEncaminhamentoAssistencial") para evitar conflito de nomes
 * - Nome da tabela alterado para "tipos_encaminhamento_assistencial"
 * - Esta entidade NÃO possui o campo "encerramento" (diferente do SAMU)
 *
 * 📌 CONTEXTO:
 * Esta entidade representa os tipos de encaminhamento específicos do módulo
 * de Assistência Social (encaminhamento para CRAS, CREAS, Conselho Tutelar, etc.).
 * Ela é diferente da entidade TipoEncaminhamento do SAMU.
 */
@Entity(name = "TipoEncaminhamentoAssistencial")  // ✅ Nome único para evitar conflito com SAMU
@Table(name = "tipos_encaminhamento_assistencial")  // ✅ Tabela específica da Assistência Social
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TipoEncaminhamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "ativo", nullable = false)
    @Builder.Default
    private Boolean ativo = true;

    @Column(name = "data_cadastro", nullable = false, updatable = false)
    private LocalDateTime dataCadastro;

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @Column(name = "usuario_cadastro", length = 100)
    private String usuarioCadastro;

    @Column(name = "usuario_atualizacao", length = 100)
    private String usuarioAtualizacao;

    // ========================================
    // 🔧 MÉTODOS AUXILIARES
    // ========================================

    /**
     * Verifica se o tipo está ativo
     */
    public boolean isAtivo() {
        return Boolean.TRUE.equals(this.ativo);
    }

    /**
     * Ativa o tipo de encaminhamento
     */
    public void ativar() {
        this.ativo = true;
        this.dataAtualizacao = LocalDateTime.now();
    }

    /**
     * Inativa o tipo de encaminhamento
     */
    public void inativar() {
        this.ativo = false;
        this.dataAtualizacao = LocalDateTime.now();
    }

    // ========================================
    // ⚙️ CALLBACKS JPA
    // ========================================

    @PrePersist
    protected void onCreate() {
        LocalDateTime agora = LocalDateTime.now();
        this.dataCadastro = agora;
        this.dataAtualizacao = agora;

        if (this.ativo == null) {
            this.ativo = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.dataAtualizacao = LocalDateTime.now();
    }

    // ========================================
    // 📝 MÉTODOS DE DOMÍNIO
    // ========================================

    /**
     * Retorna uma representação textual do tipo de encaminhamento
     */
    @Override
    public String toString() {
        return String.format("TipoEncaminhamentoAssistencial{id=%d, nome='%s', ativo=%s}",
                id, nome, ativo);
    }

    /**
     * Descrição completa para logs e auditoria
     */
    public String getDescricaoCompleta() {
        StringBuilder sb = new StringBuilder();
        sb.append(nome);
        if (descricao != null && !descricao.trim().isEmpty()) {
            sb.append(" - ").append(descricao);
        }
        return sb.toString();
    }

    /**
     * Valida se o tipo de encaminhamento é válido para uso
     */
    public boolean isValido() {
        return this.nome != null &&
                !this.nome.trim().isEmpty() &&
                Boolean.TRUE.equals(this.ativo);
    }
}