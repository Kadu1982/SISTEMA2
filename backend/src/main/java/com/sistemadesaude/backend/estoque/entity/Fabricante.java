package com.sistemadesaude.backend.estoque.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "est_fabricante")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Fabricante {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 180)
    private String razaoSocial;
}
