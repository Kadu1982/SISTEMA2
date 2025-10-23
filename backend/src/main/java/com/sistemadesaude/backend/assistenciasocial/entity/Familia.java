package com.sistemadesaude.backend.assistenciasocial.entity;

import com.sistemadesaude.backend.paciente.entity.Paciente;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Classe entidade que representa uma família no módulo de Assistência Social.
 */
@Entity
@Table(name = "familias")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Familia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo_familiar", unique = true)
    private String codigoFamiliar;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsavel_id", nullable = false)
    private Paciente responsavel;

    @Column(name = "tipo_familia")
    @Enumerated(EnumType.STRING)
    private TipoFamilia tipoFamilia;

    @Column(name = "classe_social")
    private String classeSocial;

    @Column(name = "data_cadastro")
    private LocalDateTime dataCadastro;

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @Column(name = "usuario_cadastro")
    private String usuarioCadastro;

    @Column(name = "usuario_atualizacao")
    private String usuarioAtualizacao;

    // Endereço
    private String municipio;
    private String cep;
    private String logradouro;
    private String numero;
    private String bairro;
    private String complemento;

    // Informações adicionais
    @Column(name = "quantidade_dependentes")
    private Integer quantidadeDependentes;

    @Column(name = "quantidade_pne")
    private Integer quantidadePNE;

    @Column(name = "quantidade_mulheres_gravidas")
    private Integer quantidadeMulheresGravidas;

    @Column(name = "quantidade_maes_amamentando")
    private Integer quantidadeMaesAmamentando;

    @Column(name = "data_chegada_municipio")
    private LocalDate dataChegadaMunicipio;

    // Informações sobre o domicílio
    @Column(name = "tipo_localidade")
    private String tipoLocalidade;

    @Column(name = "tipo_domicilio")
    private String tipoDomicilio;

    @Column(name = "situacao_domicilio")
    private String situacaoDomicilio;

    @Column(name = "numero_comodos")
    private Integer numeroComodos;

    @Column(name = "numero_dormitorios")
    private Integer numeroDormitorios;

    @Column(name = "pessoas_por_dormitorio")
    private Integer pessoasPorDormitorio;

    @Column(name = "tipo_piso")
    private String tipoPiso;

    @Column(name = "tipo_parede")
    private String tipoParede;

    @Column(name = "agua_canalizada")
    private Boolean aguaCanalizada;

    @Column(name = "abastecimento_agua")
    private String abastecimentoAgua;

    @Column(name = "tratamento_agua")
    private String tratamentoAgua;

    @Column(name = "possui_banheiro")
    private Boolean possuiBanheiro;

    @Column(name = "destino_fezes_urina")
    private String destinoFezesUrina;

    @Column(name = "destino_lixo")
    private String destinoLixo;

    @Column(name = "tipo_iluminacao")
    private String tipoIluminacao;

    @Column(name = "acesso_domicilio")
    private String acessoDomicilio;

    @Column(name = "acessibilidade_pne")
    private Boolean acessibilidadePNE;

    @Column(name = "area_desabamento_alagamento")
    private Boolean areaDesabamentoAlagamento;

    @Column(name = "area_dificil_acesso")
    private Boolean areaDificilAcesso;

    @Column(name = "area_conflito_violencia")
    private Boolean areaConflitoViolencia;

    // Plano de saúde
    @Column(name = "possui_plano_saude")
    private Boolean possuiPlanoSaude;

    @Column(name = "nome_plano_saude")
    private String nomePlanoSaude;

    @Column(name = "pessoas_cobertas_plano")
    private Integer pessoasCobertas;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    // Relacionamentos
    @OneToMany(mappedBy = "familia", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MembroFamilia> membros = new ArrayList<>();

    @OneToMany(mappedBy = "familia", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VulnerabilidadeFamilia> vulnerabilidades = new ArrayList<>();

    @OneToMany(mappedBy = "familia", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RendaFamilia> rendas = new ArrayList<>();

    @OneToMany(mappedBy = "familia", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DespesaFamilia> despesas = new ArrayList<>();

    @OneToMany(mappedBy = "familia", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProgramaTransferenciaRendaFamilia> programasTransferenciaRenda = new ArrayList<>();

    @OneToMany(mappedBy = "familia", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PessoaAcolhida> pessoasAcolhidas = new ArrayList<>();

    // Enums
    public enum TipoFamilia {
        CONTEMPORANEA,
        HOMOAFETIVA,
        MONOPARENTAL,
        QUILOMBOLA,
        INDIGENA,
        RIBEIRINHA,
        CIGANA
    }
}
