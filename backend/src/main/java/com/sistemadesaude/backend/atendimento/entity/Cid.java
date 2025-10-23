package com.sistemadesaude.backend.atendimento.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "cid")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cid {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo", nullable = false, unique = true)
    private String codigo;

    @Column(name = "descricao", columnDefinition = "TEXT", nullable = false)
    private String descricao;

}
