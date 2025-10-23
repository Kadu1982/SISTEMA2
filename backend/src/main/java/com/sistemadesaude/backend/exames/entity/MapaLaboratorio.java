package com.sistemadesaude.backend.exames.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "lab_mapa")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MapaLaboratorio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo", length = 20, unique = true)
    private String codigo;

    @Column(name = "descricao", length = 200, nullable = false)
    private String descricao;

    @Column(name = "setor", length = 100)
    private String setor;

    @Column(name = "ordem")
    private Integer ordem;

    @Column(name = "ativo")
    @Builder.Default
    private Boolean ativo = true;

    @OneToMany(mappedBy = "mapa", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MapaProfissional> profissionais = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}