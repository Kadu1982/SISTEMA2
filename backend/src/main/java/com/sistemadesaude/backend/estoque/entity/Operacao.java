package com.sistemadesaude.backend.estoque.entity;

import com.sistemadesaude.backend.estoque.enums.TipoOperacao;
import com.sistemadesaude.backend.estoque.enums.TipoEntrada;
import com.sistemadesaude.backend.estoque.enums.TipoSaida;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "est_operacao")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Operacao {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TipoOperacao tipo;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private TipoEntrada tipoEntrada;   // obrigatório quando tipo=ENTRADA (manual)

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private TipoSaida tipoSaida;       // obrigatório quando tipo=SAIDA (manual)

    /** Integrações (BPS/Hórus) podem ser ligadas por operação – deixamos flags simples */
    private boolean exportacaoBps;
    private String operacaoHorus;

    /** Se é uma operação que exige Profissional (Saída p/ Profissional) */
    private boolean exigeProfissional;
}
