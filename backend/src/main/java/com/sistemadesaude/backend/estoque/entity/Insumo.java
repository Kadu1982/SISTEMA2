package com.sistemadesaude.backend.estoque.entity;

import com.sistemadesaude.backend.estoque.enums.TipoControleEstoque;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entidade de catálogo de Insumos do módulo de Estoque.
 * - Mapeada por padrão para a tabela "est_insumo" (Postgres).
 * - Caso sua tabela real tenha outro nome ou esteja em outro schema,
 *   ajuste o @Table(name="...") e/ou adicione schema="...".
 *
 *   Exemplo:
 *   @Table(schema = "estoque", name = "insumo")
 */
@Entity
@Table(
        name = "est_insumo",
        indexes = {
                @Index(name = "idx_est_insumo_descricao", columnList = "descricao")
        }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Insumo {

    // ---------- Identificador ----------
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ---------- Campos de apresentação ----------
    /** Descrição curta exibida nas telas de movimentação */
    @Column(nullable = false, length = 200)
    private String descricao;

    /** Apresentação (ex.: Frasco 500 ml, Comprimido, Ampola) */
    @Column(length = 120)
    private String apresentacao;

    /** Dosagem (ex.: 500 mg, 1 g/10 ml) */
    @Column(length = 60)
    private String dosagem;

    /** Descrição complementar (texto longo) */
    @Column(name = "descricao_completa", columnDefinition = "text")
    private String descricaoCompleta;

    /** Unidade de medida (ex.: CP, FR, ML, AM) */
    @Column(name = "unidade_medida", length = 20)
    private String unidadeMedida;

    // ---------- Regras de controle de estoque ----------
    /**
     * Controle de estoque:
     *   - NAO (sem controle)           [se existir no seu enum]
     *   - QUANTIDADE (padrão)
     *   - VENCIMENTO (controla por data)
     *   - LOTE_FABRICANTE (controla por lote)
     *
     * Observação: usamos EnumType.STRING para estabilidade entre versões.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "controle_estoque", nullable = false, length = 30)
    private TipoControleEstoque controleEstoque = TipoControleEstoque.QUANTIDADE;

    /** Dias antes do vencimento para alerta (quando controle por vencimento/lote) */
    @Column(name = "dias_alerta_vencimento")
    private Integer diasAlertaVencimento;

    /** Código de barras padrão do insumo (ex.: GTIN/EAN) */
    @Column(name = "codigo_barras_padrao", length = 64)
    private String codigoBarrasPadrao;

    /** Flag de ativo/inativo para catálogo (não remove historicamente) */
    @Column(nullable = false)
    private Boolean ativo = Boolean.TRUE;

    // ---------- Auditoria simples ----------
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onPersist() {
        final var now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.controleEstoque == null) {
            // fallback seguro; evita NPE no Hibernate
            this.controleEstoque = TipoControleEstoque.QUANTIDADE;
        }
        if (this.ativo == null) this.ativo = Boolean.TRUE;
        if (this.diasAlertaVencimento == null) this.diasAlertaVencimento = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        if (this.controleEstoque == null) {
            this.controleEstoque = TipoControleEstoque.QUANTIDADE;
        }
        if (this.ativo == null) this.ativo = Boolean.TRUE;
        if (this.diasAlertaVencimento == null) this.diasAlertaVencimento = 0;
    }
}
