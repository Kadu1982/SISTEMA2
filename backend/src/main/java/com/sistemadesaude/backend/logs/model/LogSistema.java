package com.sistemadesaude.backend.logs.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Entidade simples para persistir eventos no banco {@code logs_sistema}.
 * <p>
 * O controlador de atendimento depende dessa classe para registrar ações.
 * Mantemos a modelagem enxuta para corresponder à migração existente
 * (V13__create_logs_sistema.sql).
 */
@Getter
@Setter
@Entity
@Table(name = "logs_sistema")
public class LogSistema {

    @Id
    private String id;

    @Column(name = "usuario_id", length = 100)
    private String usuarioId;

    @Column(length = 100)
    private String acao;

    @Column(length = 100)
    private String tabela;

    @Column(name = "registro_id", length = 100)
    private String registroId;

    @Column(name = "\"timestamp\"", columnDefinition = "timestamptz")
    private OffsetDateTime timestamp;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        if (timestamp == null) {
            timestamp = OffsetDateTime.now();
        }
    }
}
