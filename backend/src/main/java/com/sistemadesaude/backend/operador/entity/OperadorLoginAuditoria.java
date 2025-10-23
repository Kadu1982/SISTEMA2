package com.sistemadesaude.backend.operador.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

/**
 * Auditoria de tentativas de login (sucesso/falha)
 * Tabela: operador_login_auditoria
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@Entity
@Table(name = "operador_login_auditoria")
public class OperadorLoginAuditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Pode ser null em falhas de login onde não localizamos o operador
    @Column(name = "operador_id")
    private Long operadorId;

    @Column(name = "data_hora", nullable = false, columnDefinition = "timestamptz")
    private OffsetDateTime dataHora = OffsetDateTime.now();

    @Column(length = 64)
    private String ip;

    @Column(name = "user_agent", columnDefinition = "text")
    private String userAgent;

    @Column(nullable = false)
    private Boolean sucesso;

    @Column(columnDefinition = "text")
    private String motivo;
}
