package com.sistemadesaude.backend.exames.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "lab_campo_exame")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampoExame {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exame_id", nullable = false)
    private Exame exame;

    @Column(name = "nome", length = 100, nullable = false)
    private String nome;

    @Column(name = "label", length = 200, nullable = false)
    private String label;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_campo", length = 20, nullable = false)
    private TipoCampo tipoCampo;

    @Column(name = "ordem", nullable = false)
    private Integer ordem;

    @Column(name = "obrigatorio")
    @Builder.Default
    private Boolean obrigatorio = false;

    @Column(name = "tamanho_maximo")
    private Integer tamanhoMaximo;

    @Lob
    @Column(name = "opcoes_lista")
    private String opcoesLista; // JSON array para tipo LISTA

    @Column(name = "valor_padrao", length = 500)
    private String valorPadrao;

    @Column(name = "unidade_medida", length = 20)
    private String unidadeMedida;

    @Column(name = "casas_decimais")
    private Integer casasDecimais;

    @Column(name = "valor_minimo")
    private Double valorMinimo;

    @Column(name = "valor_maximo")
    private Double valorMaximo;

    @Column(name = "mascara", length = 50)
    private String mascara;

    @Column(name = "mostrar_laudo")
    @Builder.Default
    private Boolean mostrarLaudo = true;

    @Column(name = "ativo")
    @Builder.Default
    private Boolean ativo = true;

    public enum TipoCampo {
        TEXTO,           // Input text
        NUMERO,          // Input number
        DECIMAL,         // Input decimal
        LISTA,           // Select/dropdown
        MEMORANDO,       // Textarea
        DATA,            // Date picker
        HORA,            // Time picker
        CHECKBOX,        // Boolean
        RADIO,           // Radio buttons
        ARQUIVO          // Upload de arquivo
    }
}