package com.sistemadesaude.backend.samu.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * ☎️ TIPO DE LIGAÇÃO
 *
 * Define os tipos de ligação recebidas pelo SAMU
 * (Emergência, Urgência, Trote, Informação, etc.)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "samu_tipo_ligacao")
public class TipoLigacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome", nullable = false)
    private String nome;

    @Column(name = "descricao", columnDefinition = "TEXT")
    private String descricao;

    /**
     * Se TRUE, indica que este tipo de ligação encerra a solicitação
     * (ex: Trote, Falso Alarme, Informação)
     */
    @Column(name = "encerramento")
    private Boolean encerramento = false;

    @Column(name = "ativo")
    private Boolean ativo = true;

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao = LocalDateTime.now();

    public boolean isAtivo() {
        return Boolean.TRUE.equals(ativo);
    }

    public boolean isEncerramento() {
        return Boolean.TRUE.equals(encerramento);
    }
}
