package com.sistemadesaude.backend.saudefamilia.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sf_area_profissional")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VinculoAreaProfissional {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "area_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Area area;

    @Column(name = "profissional_id", nullable = false)
    private Long profissionalId;

    private String especialidade;

    @Column(nullable = false)
    private String situacao = "ATIVO"; // ATIVO/INATIVO

    @Column(name = "treinamento_introdutorio")
    private Boolean treinamentoIntrodutorio = Boolean.FALSE;
    @Column(name = "avaliacao_coletiva")
    private Boolean avaliacaoColetiva = Boolean.FALSE;
    @Column(name = "assistencia_mulher")
    private Boolean assistenciaMulher = Boolean.FALSE;
    @Column(name = "assistencia_crianca")
    private Boolean assistenciaCrianca = Boolean.FALSE;
    @Column(name = "capacitacao_pedagogica")
    private Boolean capacitacaoPedagogica = Boolean.FALSE;
}
