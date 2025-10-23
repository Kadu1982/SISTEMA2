package com.sistemadesaude.backend.estoque.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "est_lote",
        uniqueConstraints = {
                // evita duplicidade de lotes por insumo + fabricante + código de barras
                @UniqueConstraint(name="uk_lote_insumo_fab_codigo",
                        columnNames = {"insumo_id", "fabricante_id", "codigo_barras"})
        })
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Lote {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "insumo_id")
    private Insumo insumo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fabricante_id")
    private Fabricante fabricante;

    /** Texto do lote do fabricante (etiqueta/caixa) */
    @Column(nullable = false, length = 60)
    private String loteFabricante;

    /** Código de barras do lote ou do insumo (13 dígitos na regra do manual) */
    @Column(name = "codigo_barras", length = 20)
    private String codigoBarras;

    /** Data de vencimento deste lote */
    private LocalDate dataVencimento;

    /** Campo livre para localização física (ex.: prateleira, gaveta) */
    private String localizacaoFisica;
}
