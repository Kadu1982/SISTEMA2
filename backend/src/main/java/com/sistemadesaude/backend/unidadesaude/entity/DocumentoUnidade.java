package com.sistemadesaude.backend.unidadesaude.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Documento/Convênio/Dados bancários vinculados a uma Unidade de Saúde
 */
@Entity
@Table(name = "documentos_unidade")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentoUnidade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidade_id", nullable = false)
    private UnidadeSaude unidade;

    @Column(name = "tipo_convenio", length = 100)
    private String tipoConvenio;

    @Column(name = "retencao_tributos")
    private Boolean retencaoTributos;

    @Column(name = "alvara_numero", length = 100)
    private String alvaraNumero;

    @Column(name = "alvara_validade")
    private LocalDate alvaraValidade;

    // Dados bancários
    @Column(name = "banco", length = 100)
    private String banco;

    @Column(name = "agencia", length = 20)
    private String agencia;

    @Column(name = "conta", length = 30)
    private String conta;

    @Column(name = "pix", length = 200)
    private String pix;
}
