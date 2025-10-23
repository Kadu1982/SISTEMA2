package com.sistemadesaude.backend.hospitalar.entity;

import com.sistemadesaude.backend.unidadesaude.entity.UnidadeSaude;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "painel_atendimento")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PainelAtendimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome", nullable = false)
    private String nome;

    @Column(name = "localizacao", nullable = false)
    private String localizacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fila_id")
    private FilaAtendimento fila;

    @Column(name = "configuracao_campos")
    private String configuracaoCampos; // JSON com campos a exibir

    @Column(name = "configuracao_layout")
    private String configuracaoLayout; // JSON com layout do painel

    @Column(name = "chamada_tela_cheia")
    private Boolean chamadaTelaCheia = false;

    @Column(name = "chamada_com_som")
    private Boolean chamadaComSom = true;

    @Column(name = "chamada_com_voz")
    private Boolean chamadaComVoz = true;

    @Column(name = "tipo_voz")
    @Enumerated(EnumType.STRING)
    private TipoVoz tipoVoz;

    @Column(name = "exibir_direcao")
    private Boolean exibirDirecao = true;

    @Column(name = "exibir_local")
    private Boolean exibirLocal = true;

    @Column(name = "exibir_ultimas_senhas")
    private Boolean exibirUltimasSenhas = true;

    @Column(name = "qtd_ultimas_senhas")
    private Integer qtdUltimasSenhas = 5;

    @Column(name = "exibir_multimedia")
    private Boolean exibirMultimedia = false;

    @Column(name = "multimedia_config")
    private String multimediaConfig; // JSON com configuração de mídia

    @Column(name = "exibir_fila_espera")
    private Boolean exibirFilaEspera = true;

    @Column(name = "exibir_tempo_espera")
    private Boolean exibirTempoEspera = true;

    @Column(name = "ativo")
    private Boolean ativo = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidade_id")
    private UnidadeSaude unidade;

    @Column(name = "setor_id")
    private Long setorId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum TipoVoz {
        MASCULINA,
        FEMININA,
        ESPECIFICA
    }
}