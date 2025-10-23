package com.sistemadesaude.backend.estoque.entity;

import com.sistemadesaude.backend.unidadesaude.entity.UnidadeSaude;
import com.sistemadesaude.backend.estoque.enums.StatusTransferencia;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "est_transferencia")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Transferencia {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false) private UnidadeSaude unidadeOrigem;
    @ManyToOne(optional = false) private LocalArmazenamento localOrigem;

    @ManyToOne(optional = false) private UnidadeSaude unidadeDestino;
    @ManyToOne(optional = false) private LocalArmazenamento localDestino;

    private LocalDateTime dataHora;

    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    private StatusTransferencia status = StatusTransferencia.PENDENTE;

    private String observacoes;

    @OneToMany(mappedBy = "transferencia", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TransferenciaItem> itens = new ArrayList<>();

    /** Quando gerou entrada automaticamente no destino */
    private boolean entradaGerada;
}
