package com.sistemadesaude.backend.logs.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Log simples de ações no sistema.
 * Foi movido do antigo pacote "verdepois" para um pacote oficial e limpo.
 */
@Entity
@Table(name = "logs_sistema")
public class LogSistema {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID) // Hibernate 6+
    private String id;

    @Column(name = "usuario_id")
    private String usuarioId;

    @Column(name = "acao")
    private String acao;

    @Column(name = "tabela")
    private String tabela;

    @Column(name = "registro_id")
    private String registroId;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }

    // Getters/Setters ---------------------------------------------------------

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsuarioId() { return usuarioId; }
    public void setUsuarioId(String usuarioId) { this.usuarioId = usuarioId; }

    public String getAcao() { return acao; }
    public void setAcao(String acao) { this.acao = acao; }

    public String getTabela() { return tabela; }
    public void setTabela(String tabela) { this.tabela = tabela; }

    public String getRegistroId() { return registroId; }
    public void setRegistroId(String registroId) { this.registroId = registroId; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
