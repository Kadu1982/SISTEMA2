package com.sistemadesaude.backend.profissional.entity;

import com.sistemadesaude.backend.unidadesaude.entity.UnidadeSaude;
import jakarta.persistence.*;
import lombok.*;

/**
 * Vínculo institucional do profissional com Unidade/Setor/Cargo/Função/Turno...
 * OBS: não confundir com VinculoAreaProfissional (Saúde da Família), que continuará existindo.
 */
@Entity
@Table(name = "profissional_vinculos_unidade")
@Getter @Setter @Builder
@AllArgsConstructor @NoArgsConstructor
public class VinculoProfissionalUnidade {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relação com profissional
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profissional_id", nullable = false)
    private Profissional profissional;

    // Unidade de Saúde
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidade_id", nullable = false)
    private UnidadeSaude unidade;

    // Metadados do vínculo
    private String setor;
    private String cargo;
    private String funcao;
    private String empregadorCnpj;
    private String telefoneComercial;
    private String ramal;
    private String turno; // Livre por enquanto (ex.: MANHA, TARDE, NOITE)

    private Boolean ativo;
}
