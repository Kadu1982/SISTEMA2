package com.sistemadesaude.backend.estoque.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "est_fornecedor")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Fornecedor {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 180)
    private String razaoSocial;

    @Column(length = 18)
    private String cnpj;
}
