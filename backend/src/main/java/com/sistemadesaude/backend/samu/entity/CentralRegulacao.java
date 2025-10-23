package com.sistemadesaude.backend.samu.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

/**
 * 🏢 ENTIDADE CENTRAL DE REGULAÇÃO SAMU
 *
 * Representa uma central de regulação que coordena
 * as operações SAMU em uma região específica.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "samu_central_regulacao")
public class CentralRegulacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome", nullable = false)
    private String nome;

    @Column(name = "codigo", unique = true, nullable = false)
    private String codigo;

    @Column(name = "telefone", nullable = false)
    private String telefone;

    @Column(name = "endereco", nullable = false)
    private String endereco;

    @Column(name = "cidade", nullable = false)
    private String cidade;

    @Column(name = "estado", nullable = false)
    private String estado;

    @Column(name = "cep")
    private String cep;

    // Informações operacionais
    @Column(name = "ativa")
    private Boolean ativa = true;

    @Column(name = "horario_funcionamento")
    private String horarioFuncionamento;

    @Column(name = "capacidade_maxima")
    private Integer capacidadeMaxima;

    @Column(name = "ocupacao_atual")
    private Integer ocupacaoAtual = 0;

    // Coordenadas para localização
    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    // Informações de contato
    @Column(name = "email_contato")
    private String emailContato;

    @Column(name = "responsavel")
    private String responsavel;

    // Relacionamentos
    @OneToMany(mappedBy = "centralRegulacao", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Ocorrencia> ocorrencias = new ArrayList<>();

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao = LocalDateTime.now();

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @PreUpdate
    private void preUpdate() {
        this.dataAtualizacao = LocalDateTime.now();
    }

    // Métodos helper
    public boolean isAtiva() {
        return Boolean.TRUE.equals(ativa);
    }

    public Double getPercentualOcupacao() {
        if (capacidadeMaxima == null || capacidadeMaxima == 0) return 0.0;
        return (ocupacaoAtual.doubleValue() / capacidadeMaxima.doubleValue()) * 100;
    }

    public String getStatusOperacional() {
        if (!isAtiva()) return "INATIVA";

        Double ocupacao = getPercentualOcupacao();
        if (ocupacao >= 90) return "CRITICA";
        if (ocupacao >= 70) return "ALTA";
        if (ocupacao >= 50) return "MEDIA";
        return "NORMAL";
    }
}
