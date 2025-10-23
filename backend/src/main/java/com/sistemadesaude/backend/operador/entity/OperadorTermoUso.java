package com.sistemadesaude.backend.operador.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;

/**
 * Aceite de Termo de Uso por versão.
 * Tabela: operador_termo_uso
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@Entity
@Table(name = "operador_termo_uso",
        uniqueConstraints = @UniqueConstraint(columnNames = {"operador_id", "versao"}))
public class OperadorTermoUso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "operador_id", nullable = false)
    private Long operadorId;

    @Column(nullable = false, length = 40)
    private String versao;

    @Column(name = "aceito_em", nullable = false, columnDefinition = "timestamptz")
    private OffsetDateTime aceitoEm = OffsetDateTime.now();

    @Column(length = 64)
    private String ip;

    @Column(name = "user_agent", columnDefinition = "text")
    private String userAgent;

    public void setMotivo(String motivo) {
    }

    public void setObservacao(String observacao) {
    }

    public void setDataAceite(LocalDateTime now) {

    }
}
