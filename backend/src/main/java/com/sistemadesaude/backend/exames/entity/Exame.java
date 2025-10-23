package com.sistemadesaude.backend.exames.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "lab_exame")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Exame {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Aba Exame
    @Column(name = "codigo", length = 20, unique = true, nullable = false)
    private String codigo;

    @Column(name = "nome", length = 200, nullable = false)
    private String nome;

    @Column(name = "nome_resumido", length = 100)
    private String nomeResumido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grupo_id")
    private GrupoExame grupo;

    @Column(name = "sinonimo", length = 200)
    private String sinonimo;

    @Column(name = "codigo_sigtap", length = 20)
    private String codigoSigtap;

    @Column(name = "codigo_tuss", length = 20)
    private String codigoTuss;

    @Column(name = "ativo")
    @Builder.Default
    private Boolean ativo = true;

    // Validações
    @Column(name = "idade_minima")
    private Integer idadeMinima;

    @Column(name = "idade_maxima")
    private Integer idadeMaxima;

    @Enumerated(EnumType.STRING)
    @Column(name = "sexo_permitido", length = 20)
    private SexoPermitido sexoPermitido;

    @Column(name = "dias_validade")
    private Integer diasValidade;

    // Aba Agendamento/Atendimento
    @Column(name = "permite_agendamento")
    @Builder.Default
    private Boolean permiteAgendamento = true;

    @Column(name = "exame_urgencia")
    @Builder.Default
    private Boolean exameUrgencia = false;

    @Column(name = "tempo_realizacao_minutos")
    private Integer tempoRealizacaoMinutos;

    @Column(name = "qtd_sessoes")
    private Integer quantidadeSessoes;

    @Lob
    @Column(name = "orientacoes_paciente")
    private String orientacoesPaciente;

    @Lob
    @Column(name = "preparo")
    private String preparo;

    // Aba Materiais
    @OneToMany(mappedBy = "exame", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ExameMaterial> materiais = new ArrayList<>();

    // Aba Mapa
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mapa_id")
    private MapaLaboratorio mapa;

    @Column(name = "ordem_mapa")
    private Integer ordemMapa;

    // Aba Digitação
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_digitacao", length = 20)
    @Builder.Default
    private TipoDigitacao tipoDigitacao = TipoDigitacao.POR_CAMPO;

    @Lob
    @Column(name = "modelo_laudo")
    private String modeloLaudo;

    @Column(name = "usar_assinatura_eletronica")
    @Builder.Default
    private Boolean usarAssinaturaEletronica = false;

    // Campos dinâmicos
    @OneToMany(mappedBy = "exame", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordem ASC")
    @Builder.Default
    private List<CampoExame> campos = new ArrayList<>();

    // Métodos/Valores de referência
    @OneToMany(mappedBy = "exame", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MetodoExame> metodos = new ArrayList<>();

    // Faturamento
    @Column(name = "valor_particular", precision = 10, scale = 2)
    private BigDecimal valorParticular;

    @Column(name = "valor_sus", precision = 10, scale = 2)
    private BigDecimal valorSus;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_faturamento", length = 20)
    private TipoFaturamento tipoFaturamento;

    // Exames complementares
    @ManyToMany
    @JoinTable(
        name = "lab_exame_complementar",
        joinColumns = @JoinColumn(name = "exame_id"),
        inverseJoinColumns = @JoinColumn(name = "exame_complementar_id")
    )
    @Builder.Default
    private List<Exame> examesComplementares = new ArrayList<>();

    // Interfaceamento
    @Column(name = "codigo_equipamento", length = 50)
    private String codigoEquipamento;

    @Column(name = "usa_interfaceamento")
    @Builder.Default
    private Boolean usaInterfaceamento = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Enums
    public enum SexoPermitido {
        MASCULINO, FEMININO, AMBOS
    }

    public enum TipoDigitacao {
        POR_CAMPO, MEMORANDO, MISTO
    }

    public enum TipoFaturamento {
        BPA, APAC, PRESTADOR, NAO_FATURA
    }
}