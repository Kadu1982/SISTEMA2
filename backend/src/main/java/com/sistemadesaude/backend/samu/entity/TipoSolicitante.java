package com.sistemadesaude.backend.samu.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 📞 TIPO DE SOLICITANTE
 *
 * Define os tipos de pessoas que podem solicitar atendimento SAMU
 * (Próprio paciente, Familiar, Terceiro, Unidade de Saúde, etc.)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "samu_tipo_solicitante")
public class TipoSolicitante {

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
