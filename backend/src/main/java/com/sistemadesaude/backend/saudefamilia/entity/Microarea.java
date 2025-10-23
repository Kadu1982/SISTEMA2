package com.sistemadesaude.backend.saudefamilia.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sf_microarea")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Microarea {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "area_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Area area;

    @Column(nullable = false)
    private Integer codigo;

    @Column(name = "profissional_responsavel_id")
    private Long profissionalResponsavelId;

    private String manequim;
    private String calcado;

    @Column(nullable = false)
    private String situacao = "ATIVA";

    @Column(name = "importacao_cnes")
    private Boolean importacaoCnes = Boolean.FALSE;
}
