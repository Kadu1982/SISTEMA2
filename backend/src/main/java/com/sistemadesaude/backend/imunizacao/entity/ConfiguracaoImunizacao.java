package com.sistemadesaude.backend.imunizacao.entity;

import com.sistemadesaude.backend.unidadesaude.entity.UnidadeSaude;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "imun_configuracoes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConfiguracaoImunizacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidade_id", nullable = false)
    private UnidadeSaude unidade;

    @Column(name = "exportar_rnds")
    @Builder.Default
    private Boolean exportarRnds = false;

    @Column(name = "exportar_esus_ab")
    @Builder.Default
    private Boolean exportarEsusAb = false;

    @Column(name = "exportar_sipni")
    @Builder.Default
    private Boolean exportarSipni = true;

    @Column(name = "url_webservice_rnds", length = 500)
    private String urlWebserviceRnds;

    @Column(name = "token_rnds", length = 1000)
    private String tokenRnds;

    @Column(name = "certificado_digital_path", length = 500)
    private String certificadoDigitalPath;

    @Column(name = "senha_certificado", length = 255)
    private String senhaCertificado;

    @Column(name = "intervalo_exportacao_minutos")
    @Builder.Default
    private Integer intervaloExportacaoMinutos = 60;

    @Column(name = "ativo")
    @Builder.Default
    private Boolean ativo = true;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    private void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}