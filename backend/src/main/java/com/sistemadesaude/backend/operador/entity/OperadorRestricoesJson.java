package com.sistemadesaude.backend.operador.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Armazena um JSON (conteúdo livre) com as restrições do operador.
 * Útil para fase 1 (rápida) — depois podemos normalizar por programa/fila/etc.
 */
@Entity
@Table(name = "operador_restricoes_json")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class OperadorRestricoesJson {

    /** PK = operador_id (1:1 com Operador) */
    @Id
    @Column(name = "operador_id")
    private Long operadorId;

    /**
     * Conteúdo JSON (texto). No PostgreSQL está como JSONB; o JPA grava como String.
     * Ex.: {"agendamento":{"permitido":true},"fila":{"ids":[1,2,3]}}
     */
    @Lob
    @Column(name = "conteudo_json", columnDefinition = "jsonb")
    private String conteudoJson;

    /** Última atualização do blob */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
