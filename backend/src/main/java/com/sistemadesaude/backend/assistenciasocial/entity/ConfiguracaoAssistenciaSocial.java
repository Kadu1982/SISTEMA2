package com.sistemadesaude.backend.assistenciasocial.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Classe entidade que representa as configurações do módulo de Assistência Social.
 */
@Entity
@Table(name = "configuracoes_assistencia_social")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConfiguracaoAssistenciaSocial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tempo_atualizacao_telas")
    private Integer tempoAtualizacaoTelas;

    @Column(name = "valor_salario_minimo", precision = 10, scale = 2)
    private BigDecimal valorSalarioMinimo;

    @Column(name = "valor_linha_pobreza", precision = 10, scale = 2)
    private BigDecimal valorLinhaPobreza;

    @Column(name = "valor_linha_extrema_pobreza", precision = 10, scale = 2)
    private BigDecimal valorLinhaExtremaPobreza;

    @Column(name = "tempo_atendimento_profissionais")
    private Integer tempoAtendimentoProfissionais;

    @Column(name = "tempo_alteracao_atendimento_individual")
    private Integer tempoAlteracaoAtendimentoIndividual;

    @Column(name = "valor_beneficio_familia_acolhedora", precision = 10, scale = 2)
    private BigDecimal valorBeneficioFamiliaAcolhedora;

    @Column(name = "valor_beneficio_familia_acolhedora_especial", precision = 10, scale = 2)
    private BigDecimal valorBeneficioFamiliaAcolhedoraEspecial;

    @Column(name = "tempo_alteracao_contrareferencia")
    private Integer tempoAlteracaoContrareferencia;

    @Column(name = "tempo_alteracao_dispensacao_beneficios")
    private Integer tempoAlteracaoDispensacaoBeneficios;

    @Column(name = "desligar_integrante_grupo_servico")
    private Boolean desligarIntegranteGrupoServico;

    @Column(name = "alertar_dispensacao_beneficio_duplicado")
    private Boolean alertarDispensacaoBeneficioDuplicado;

    @Column(name = "permitir_transferencia_integrantes")
    private Boolean permitirTransferenciaIntegrantes;

    @Column(name = "campo_valor_base_obrigatorio")
    private Boolean campoValorBaseObrigatorio;

    @Column(name = "somente_integrantes_familia_atendimento_coletivo")
    private Boolean somenteIntegrantesFamiliaAtendimentoColetivo;

    @Column(name = "controle_automatico_pobreza")
    private Boolean controleAutomaticoPobreza;

    @Column(name = "profissionais_indicadores_rma")
    private Boolean profissionaisIndicadoresRma;

    @Column(name = "controle_separado_familia_acolhedora")
    private Boolean controleSeparadoFamiliaAcolhedora;

    @Column(name = "evitar_unificacao_exclusao_familias_acolhedoras")
    private Boolean evitarUnificacaoExclusaoFamiliasAcolhedoras;

    @Column(name = "portal_solicitacao_acesso")
    private Boolean portalSolicitacaoAcesso;

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @Column(name = "usuario_atualizacao")
    private String usuarioAtualizacao;

    @OneToMany(mappedBy = "configuracao", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VinculoUnidadeVulnerabilidade> vinculosUnidadeVulnerabilidade;
}
