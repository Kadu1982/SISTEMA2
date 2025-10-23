package com.sistemadesaude.backend.assistenciasocial.entity;

import com.sistemadesaude.backend.operador.entity.Operador;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Classe entidade que representa uma unidade assistencial (CRAS, CREAS, Centro POP).
 */
@Entity
@Table(name = "unidades_assistenciais")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UnidadeAssistencial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(name = "codigo_identificacao", unique = true)
    private String codigoIdentificacao;

    @Column(name = "tipo_unidade")
    @Enumerated(EnumType.STRING)
    private TipoUnidade tipoUnidade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsavel_id")
    private Operador responsavel;

    @Column(name = "data_implantacao")
    private LocalDate dataImplantacao;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "area_geografica")
    @Enumerated(EnumType.STRING)
    private AreaGeografica areaGeografica;

    @Column(name = "implantacao_recursos")
    @Enumerated(EnumType.STRING)
    private EsferaAdministrativa implantacaoRecursos;

    @Column(name = "fonte_recursos")
    @Enumerated(EnumType.STRING)
    private EsferaAdministrativa fonteRecursos;

    // Endereço
    private String municipio;
    private String cep;
    private String logradouro;
    private String numero;
    private String bairro;
    private String complemento;

    // Contato
    private String telefone;
    private String fax;
    private String email;

    @Column(name = "data_cadastro")
    private LocalDateTime dataCadastro;

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @Column(name = "usuario_cadastro")
    private String usuarioCadastro;

    @Column(name = "usuario_atualizacao")
    private String usuarioAtualizacao;

    @OneToMany(mappedBy = "unidade", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VinculoUnidadeVulnerabilidade> vulnerabilidades = new ArrayList<>();

    // Enums
    public enum TipoUnidade {
        CRAS,
        CREAS,
        CENTRO_POP
    }

    public enum AreaGeografica {
        RURAL,
        URBANA
    }

    public enum EsferaAdministrativa {
        MUNICIPAL_DF,
        ESTADUAL,
        FEDERAL
    }
}
