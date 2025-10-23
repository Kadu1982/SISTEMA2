package com.sistemadesaude.backend.samu.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * ✅ ENTIDADE: Tipo de Encaminhamento do SAMU
 *
 * 🔧 CORREÇÃO APLICADA:
 * - Adicionado @Entity(name = "TipoEncaminhamentoSamu") para evitar conflito de nomes
 * - Nome da tabela alterado para "tipos_encaminhamento_samu"
 * - Campo "encerramento" adicionado para indicar se encerra a ocorrência
 *
 * 📌 CONTEXTO:
 * Esta entidade representa os tipos de encaminhamento específicos do módulo SAMU.
 * Ela é diferente da entidade TipoEncaminhamento da Assistência Social, por isso
 * foi necessário dar nomes distintos para ambas.
 */
@Entity(name = "TipoEncaminhamentoSamu")  // ✅ Nome único para evitar conflito com Assistência Social
@Table(name = "tipos_encaminhamento_samu")  // ✅ Tabela específica do SAMU
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

    /**
     * ✅ NOVO: Indica se este tipo de encaminhamento encerra a ocorrência
     *
     * Exemplos:
     * - "Hospital" → encerramento = true (encerra a ocorrência)
     * - "Recusa de atendimento" → encerramento = true
     * - "Transferência" → encerramento = false (continua ativa)
     */
    @Column(name = "encerramento", nullable = false)
    @Builder.Default
    private Boolean encerramento = false;

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
     * Verifica se o tipo encerra a ocorrência
     */
    public boolean isEncerramento() {
        return Boolean.TRUE.equals(this.encerramento);
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

        if (this.encerramento == null) {
            this.encerramento = false;
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
        return String.format("TipoEncaminhamentoSamu{id=%d, nome='%s', encerramento=%s, ativo=%s}",
                id, nome, encerramento, ativo);
    }

    /**
     * Descrição completa para logs e auditoria
     */
    public String getDescricaoCompleta() {
        return String.format("%s (%s)", nome, encerramento ? "Encerra ocorrência" : "Não encerra");
    }
}