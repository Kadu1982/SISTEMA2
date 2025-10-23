package com.sistemadesaude.backend.operador.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

/**
 * Domínio de Setores de Atendimento (Recepção, Triagem, RX, Farmácia etc.)
 * Tabela: setores_atendimento
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@Entity
@Table(name = "setores_atendimento")
public class SetorAtendimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120, unique = true)
    private String nome;

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
