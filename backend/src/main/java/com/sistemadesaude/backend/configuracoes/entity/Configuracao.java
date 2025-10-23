package com.sistemadesaude.backend.configuracoes.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Entidade que representa uma configuração do sistema
 */
@Entity
@Table(name = "configuracoes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Configuracao {

    /**
     * Chave única da configuração
     */
    @Id
    @Column(name = "chave", length = 100, nullable = false, unique = true)
    private String chave;

    /**
     * Valor da configuração
     */
    @Column(name = "valor", columnDefinition = "TEXT", nullable = false)
    private String valor;

    /**
     * Descrição da configuração
     */
    @Column(name = "descricao", columnDefinition = "TEXT")
    private String descricao;

    /**
     * Grupo da configuração (para organização)
     */
    @Column(name = "grupo", length = 50)
    private String grupo;

    /**
     * Tipo de dado da configuração (string, number, boolean, json, etc.)
     */
    @Column(name = "tipo", length = 20)
    private String tipo;

    /**
     * Indica se a configuração é editável pela interface
     */
    @Column(name = "editavel", nullable = false)
    private boolean editavel;

    /**
     * Valores possíveis para a configuração (para campos de seleção)
     */
    @Column(name = "valores_possiveis", columnDefinition = "TEXT")
    private String valoresPossiveis;

    /**
     * Data de criação do registro
     */
    @CreationTimestamp
    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    /**
     * Data da última atualização do registro
     */
    @UpdateTimestamp
    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    /**
     * Usuário que criou o registro
     */
    @Column(name = "criado_por", length = 50)
    private String criadoPor;

    /**
     * Usuário que atualizou o registro pela última vez
     */
    @Column(name = "atualizado_por", length = 50)
    private String atualizadoPor;
}
