package com.sistemadesaude.backend.operador.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

/**
 * Restrições de acesso por operador (IP/Host/Data/Outro)
 * Tabela: operador_restricoes_acesso
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@Entity
@Table(name = "operador_restricoes_acesso")
public class OperadorRestricaoAcesso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // FK lógica – evitamos @ManyToOne para não acoplar no Operador
    @Column(name = "operador_id", nullable = false)
    private Long operadorId;

    /**
     * Tipos aceitos: IP, HOST, DATA, OUTRO (mesmo CHECK do SQL)
     */
    @Column(nullable = false, length = 30)
    private String tipo;

    /**
     * Valor da restrição (ex.: 200.200.200.0/24, workstation-01, 2025-12-31)
     */
    @Column(nullable = false, columnDefinition = "text")
    private String valor;

    @Column(columnDefinition = "text")
    private String observacao;

    @Column(nullable = false)
    private Boolean ativo = true;

    @Column(name = "criado_por", length = 50)
    private String criadoPor;

    @Column(name = "atualizado_por", length = 50)
    private String atualizadoPor;

    @Column(name = "data_criacao", nullable = false, columnDefinition = "timestamptz")
    private OffsetDateTime dataCriacao = OffsetDateTime.now();

    @Column(name = "data_atualizacao", nullable = false, columnDefinition = "timestamptz")
    private OffsetDateTime dataAtualizacao = OffsetDateTime.now();
}
