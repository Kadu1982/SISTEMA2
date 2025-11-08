package com.sistemadesaude.backend.procedimentosrapidos.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Immutable;

import java.time.LocalDateTime;

/**
 * Entidade que representa uma Assinatura Digital
 * Sistema de dupla senha para garantir autenticidade e rastreabilidade
 * 
 * Fluxo:
 * 1. Operador cria senha de assinatura (diferente da senha de login)
 * 2. Para assinar uma atividade, valida senha de login + senha de assinatura
 * 3. Registro é imutável após criação (auditoria)
 * 
 * Campos imutáveis garantidos pela anotação @Immutable do Hibernate
 */
@Entity
@Table(name = "assinaturas_digitais")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Immutable // Registro imutável após criação
public class AssinaturaDigital {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    /**
     * ID do operador que criou/assinou
     */
    @Column(name = "operador_id", nullable = false)
    private Long operadorId;

    /**
     * Hash BCrypt da senha de assinatura (diferente da senha de login)
     * Formato: $2a$10$... ou $2b$10$...
     */
    @Column(name = "senha_assinatura_hash", nullable = false, length = 255)
    private String senhaAssinaturaHash;

    /**
     * Timestamp da assinatura (quando a atividade foi assinada)
     * Null se este registro for apenas o cadastro da senha de assinatura
     */
    @Column(name = "data_hora_assinatura")
    private LocalDateTime dataHoraAssinatura;

    /**
     * IP do operador no momento da assinatura
     */
    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    /**
     * ID da atividade de enfermagem que foi assinada
     * Null se este registro for apenas o cadastro da senha de assinatura
     */
    @Column(name = "atividade_enfermagem_id")
    private Long atividadeEnfermagemId;

    /**
     * COREN do operador que assinou
     */
    @Column(name = "coren_operador", length = 20)
    private String corenOperador;

    /**
     * Data de criação do registro (auditoria)
     */
    @CreationTimestamp
    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;
}
