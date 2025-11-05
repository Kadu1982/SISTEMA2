package com.sistemadesaude.backend.audit.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entidade para auditoria de acessos e operações críticas do sistema.
 * Armazena logs de ações dos usuários para conformidade LGPD e segurança.
 */
@Entity
@Table(name = "audit_log", indexes = {
    @Index(name = "idx_audit_usuario", columnList = "usuario_id"),
    @Index(name = "idx_audit_data", columnList = "data_hora"),
    @Index(name = "idx_audit_tipo", columnList = "tipo_operacao"),
    @Index(name = "idx_audit_entidade", columnList = "entidade_tipo, entidade_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id")
    private Long usuarioId;

    @Column(name = "usuario_nome", length = 200)
    private String usuarioNome;

    @Column(name = "usuario_cpf", length = 14)
    private String usuarioCpf;

    @Column(name = "tipo_operacao", length = 50, nullable = false)
    @Enumerated(EnumType.STRING)
    private TipoOperacao tipoOperacao;

    @Column(name = "entidade_tipo", length = 100)
    private String entidadeTipo;

    @Column(name = "entidade_id")
    private Long entidadeId;

    @Column(name = "descricao", length = 500)
    private String descricao;

    @Column(name = "ip_origem", length = 45)
    private String ipOrigem;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "endpoint", length = 500)
    private String endpoint;

    @Column(name = "metodo_http", length = 10)
    private String metodoHttp;

    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;

    @Column(name = "sucesso")
    private Boolean sucesso;

    @Column(name = "mensagem_erro", length = 1000)
    private String mensagemErro;

    @Column(name = "dados_antes", columnDefinition = "TEXT")
    private String dadosAntes;

    @Column(name = "dados_depois", columnDefinition = "TEXT")
    private String dadosDepois;

    public enum TipoOperacao {
        LOGIN,
        LOGOUT,
        CREATE,
        READ,
        UPDATE,
        DELETE,
        EXPORT,
        IMPORT,
        ACESSO_DADOS_SENSIVEIS,
        ALTERACAO_PERMISSAO,
        FALHA_AUTENTICACAO,
        TENTATIVA_ACESSO_NAO_AUTORIZADO
    }

    @PrePersist
    public void prePersist() {
        if (dataHora == null) {
            dataHora = LocalDateTime.now();
        }
        if (sucesso == null) {
            sucesso = true;
        }
    }
}
