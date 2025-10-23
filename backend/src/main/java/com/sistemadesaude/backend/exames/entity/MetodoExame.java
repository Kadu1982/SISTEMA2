package com.sistemadesaude.backend.exames.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "lab_metodo_exame")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MetodoExame {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exame_id", nullable = false)
    private Exame exame;

    @Column(name = "nome_metodo", length = 200, nullable = false)
    private String nomeMetodo;

    @Column(name = "descricao", length = 500)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(name = "sexo", length = 20)
    private SexoReferencia sexo;

    @Column(name = "idade_minima_meses")
    private Integer idadeMinimaMeses;

    @Column(name = "idade_maxima_meses")
    private Integer idadeMaximaMeses;

    @Column(name = "valor_referencia_min")
    private Double valorReferenciaMin;

    @Column(name = "valor_referencia_max")
    private Double valorReferenciaMax;

    @Lob
    @Column(name = "valor_referencia_texto")
    private String valorReferenciaTexto;

    @Column(name = "unidade_medida", length = 20)
    private String unidadeMedida;

    @Column(name = "ativo")
    @Builder.Default
    private Boolean ativo = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum SexoReferencia {
        MASCULINO, FEMININO, AMBOS
    }
}