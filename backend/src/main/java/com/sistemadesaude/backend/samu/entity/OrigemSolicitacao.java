package com.sistemadesaude.backend.samu.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 📡 ORIGEM DA SOLICITAÇÃO
 *
 * Define de onde veio a solicitação de atendimento
 * (Telefone 192, Unidade de Saúde, Polícia/Bombeiros, etc.)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "samu_origem_solicitacao")
public class OrigemSolicitacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome", nullable = false)
    private String nome;

    @Column(name = "descricao", columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "ativo")
    private Boolean ativo = true;

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao = LocalDateTime.now();

    public boolean isAtivo() {
        return Boolean.TRUE.equals(ativo);
    }
}
