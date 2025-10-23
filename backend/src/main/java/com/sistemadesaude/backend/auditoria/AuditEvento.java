package com.sistemadesaude.backend.auditoria;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

/**
 * Entidade de auditoria de operações CRUD sensíveis.
 *
 * Observações:
 * - Mapeia a tabela "audit_evento".
 * - Mantemos payload RESUMIDO (texto) para evitar vazamento de dados sensíveis.
 *
 * Correção aplicada (sem "gambiarra"):
 * - Em PostgreSQL não existe CLOB; @Lob em String induz o Hibernate a esperar CLOB/oid.
 * - A coluna no banco é TEXT. Para alinhar, removemos @Lob e tipamos como LONGVARCHAR + columnDefinition="text".
 * - Isso elimina o erro:
 *   "Schema-validation: wrong column type ... payload_resumo ... found text, but expecting oid (Types#CLOB)".
 */
@Entity
@Table(name = "audit_evento")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditEvento {

    /** Chave primária (auto-incremento) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Momento do evento (DEFAULT NOW() na migration) */
    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;

    /** Quem executou (ID do operador logado; opcional) */
    @Column(name = "operador_id")
    private Long operadorId;

    /** Entidade lógica afetada (ex.: "OPERADOR", "ESTOQUE", "PACIENTE") */
    @Column(name = "entidade", length = 120, nullable = false)
    private String entidade;

    /** Operação CRUD: "CREATE" | "UPDATE" | "DELETE" */
    @Column(name = "operacao", length = 20, nullable = false)
    private String operacao;

    /** Recurso/endpoint que processou (ex.: "/api/operadores/123") */
    @Column(name = "recurso", length = 180)
    private String recurso;

    /**
     * Resumo do payload (não salve conteúdo sensível aqui).
     * Dica: armazene apenas nomes das classes/ids envolvidos.
     *
     * Correção:
     * - Removido @Lob (para não forçar CLOB/oid em Postgres).
     * - Definido como TEXT no DDL e tratado como texto longo pelo Hibernate.
     */
    @Column(name = "payload_resumo", columnDefinition = "text")
    @JdbcTypeCode(SqlTypes.LONGVARCHAR)
    private String payloadResumo;

    /** IP de origem (se disponível no HttpServletRequest) */
    @Column(name = "ip", length = 64)
    private String ip;

    /** Garante data_hora quando não vier preenchido pela aplicação */
    @PrePersist
    private void prePersist() {
        if (this.dataHora == null) {
            this.dataHora = LocalDateTime.now();
        }
    }
}
