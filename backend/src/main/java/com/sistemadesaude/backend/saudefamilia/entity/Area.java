package com.sistemadesaude.backend.saudefamilia.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "sf_area")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Area {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String descricao;

    @Column(nullable = false, unique = true, length = 15)
    private String ine;

    private String segmento;

    @Column(name = "unidade_id")
    private Long unidadeId;

    @Column(name = "tipo_equipe")
    private String tipoEquipe;

    @Column(name = "atende_pop_geral", nullable = false)
    private Boolean atendePopGeral = Boolean.TRUE;

    @Column(name = "atende_assentados", nullable = false)
    private Boolean atendeAssentados = Boolean.FALSE;

    @Column(name = "atende_quilombolas", nullable = false)
    private Boolean atendeQuilombolas = Boolean.FALSE;

    @Column(nullable = false)
    private String situacao = "ATIVA"; // ATIVA/INATIVA

    @Column(name = "importacao_cnes", nullable = false)
    private Boolean importacaoCnes = Boolean.FALSE;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "area", fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Microarea> microareas;
}
