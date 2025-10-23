package com.sistemadesaude.backend.exames.entity;

import com.sistemadesaude.backend.operador.entity.Operador;
import com.sistemadesaude.backend.profissional.entity.Profissional;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "lab_resultado_exame")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResultadoExame {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exame_recepcao_id", nullable = false, unique = true)
    private ExameRecepcao exameRecepcao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "metodo_id")
    private MetodoExame metodo;

    @Column(name = "data_resultado", nullable = false)
    private LocalDateTime dataResultado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operador_digitacao_id")
    private Operador operadorDigitacao;

    // Resultado textual (tipo memorando)
    @Lob
    @Column(name = "resultado_texto")
    private String resultadoTexto;

    // Campos dinâmicos
    @OneToMany(mappedBy = "resultado", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ValorCampoResultado> valoresCampos = new ArrayList<>();

    // Laudo
    @Lob
    @Column(name = "laudo_gerado")
    private String laudoGerado;

    @Column(name = "laudo_liberado")
    @Builder.Default
    private Boolean laudoLiberado = false;

    @Column(name = "data_liberacao")
    private LocalDateTime dataLiberacao;

    // Assinatura
    @Column(name = "assinado")
    @Builder.Default
    private Boolean assinado = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profissional_assinatura_id")
    private Profissional profissionalAssinatura;

    @Column(name = "data_assinatura")
    private LocalDateTime dataAssinatura;

    @Column(name = "assinatura_digital", length = 5000)
    private String assinaturaDigital;

    @Column(name = "certificado_digital", length = 5000)
    private String certificadoDigital;

    // Impressão
    @Column(name = "impresso")
    @Builder.Default
    private Boolean impresso = false;

    @Column(name = "data_impressao")
    private LocalDateTime dataImpressao;

    @Column(name = "quantidade_impressoes")
    @Builder.Default
    private Integer quantidadeImpressoes = 0;

    // Interfaceamento
    @Column(name = "importado_equipamento")
    @Builder.Default
    private Boolean importadoEquipamento = false;

    @Column(name = "data_importacao")
    private LocalDateTime dataImportacao;

    @Lob
    @Column(name = "dados_equipamento")
    private String dadosEquipamento;

    @Lob
    @Column(name = "observacoes")
    private String observacoes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}