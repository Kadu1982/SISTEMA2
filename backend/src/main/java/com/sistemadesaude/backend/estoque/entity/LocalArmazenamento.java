package com.sistemadesaude.backend.estoque.entity;

import com.sistemadesaude.backend.unidadesaude.entity.UnidadeSaude;
import com.sistemadesaude.backend.estoque.enums.GeracaoEntradaTransferencia;
import com.sistemadesaude.backend.estoque.enums.PoliticaCodigoSequencial;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "est_local_armazenamento")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class LocalArmazenamento {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Nome amigável, ex.: CAF, Farmácia UBS Centro */
    @Column(nullable = false, length = 120)
    private String nome;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "unidade_saude_id")
    private UnidadeSaude unidadeSaude;

    /** Política do código de barras sequencial (Não / por Lote / por Fabricante) */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PoliticaCodigoSequencial politicaCodigoSequencial = PoliticaCodigoSequencial.NAO;

    /** Se entradas de transferências são geradas: ao transferir, ao confirmar ou não gerar */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GeracaoEntradaTransferencia geracaoEntradaTransferencia = GeracaoEntradaTransferencia.AO_CONFIRMAR;

    /** Se o local utiliza etiqueta/código de barras por lote (implica fluxos de impressão) */
    private boolean usaCodigoBarrasPorLote = true;

    /** Local pode estar ativo ou desativado para movimentações */
    private boolean ativo = true;
}
