package com.sistemadesaude.backend.estoque.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "est_entrada")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Entrada {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false) private LocalArmazenamento local;
    @ManyToOne(optional = false) private Operacao operacao;

    private LocalDateTime dataHora;

    @Column(length = 1000)
    private String observacao;

    @OneToMany(mappedBy = "entrada", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<EntradaItem> itens = new ArrayList<>();
}
