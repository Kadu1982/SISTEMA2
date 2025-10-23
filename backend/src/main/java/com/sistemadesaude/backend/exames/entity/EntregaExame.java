package com.sistemadesaude.backend.exames.entity;

import com.sistemadesaude.backend.operador.entity.Operador;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "lab_entrega_exame")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EntregaExame {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recepcao_id", nullable = false)
    private RecepcaoExame recepcao;

    @Column(name = "data_entrega", nullable = false)
    private LocalDateTime dataEntrega;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operador_entrega_id", nullable = false)
    private Operador operadorEntrega;

    // Identificação de quem retirou
    @Column(name = "nome_retirou", length = 200, nullable = false)
    private String nomeRetirou;

    @Column(name = "documento_retirou", length = 20, nullable = false)
    private String documentoRetirou;

    @Column(name = "parentesco_retirou", length = 50)
    private String parentescoRetirou;

    // Validação de entrega
    @Column(name = "biometria_validada")
    @Builder.Default
    private Boolean biometriaValidada = false;

    @Column(name = "documento_validado")
    @Builder.Default
    private Boolean documentoValidado = false;

    // Assinatura de quem retirou
    @Column(name = "assinatura_retirada", length = 5000)
    private String assinaturaRetirada;

    // Exames entregues
    @OneToMany(mappedBy = "entrega", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ExameEntregue> examesEntregues = new ArrayList<>();

    @Lob
    @Column(name = "observacoes")
    private String observacoes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}