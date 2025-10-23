package com.sistemadesaude.backend.exames.entity;

import com.sistemadesaude.backend.operador.entity.Operador;
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
@Table(name = "lab_coleta_material")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ColetaMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recepcao_id", nullable = false)
    private RecepcaoExame recepcao;

    @Column(name = "data_coleta", nullable = false)
    private LocalDateTime dataColeta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operador_coleta_id", nullable = false)
    private Operador operadorColeta;

    @Lob
    @Column(name = "observacoes")
    private String observacoes;

    @OneToMany(mappedBy = "coleta", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MaterialColetado> materiaisColetados = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}