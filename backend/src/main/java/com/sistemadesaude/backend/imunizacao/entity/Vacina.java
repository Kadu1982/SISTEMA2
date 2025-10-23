package com.sistemadesaude.backend.imunizacao.entity;

import com.sistemadesaude.backend.imunizacao.enums.TipoVacina;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "imun_vacinas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vacina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 10)
    private String codigo;

    @Column(nullable = false, length = 200)
    private String nome;

    @Column(length = 500)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "tipo_vacina")
    private TipoVacina tipoVacina;

    @Column(name = "codigo_ledi_esus", length = 20)
    private String codigoLediEsus;

    @Column(name = "codigo_pni", length = 20)
    private String codigoPni;

    @Column(name = "ativa")
    @Builder.Default
    private Boolean ativa = true;

    @Column(name = "exportar_sipni")
    @Builder.Default
    private Boolean exportarSipni = false;

    @Column(name = "exportar_rnds")
    @Builder.Default
    private Boolean exportarRnds = false;

    @Column(name = "calendario_vacinal")
    @Builder.Default
    private Boolean calendarioVacinal = true;

    @Column(name = "idade_minima_dias")
    private Integer idadeMinimaEmDias;

    @Column(name = "idade_maxima_dias")
    private Integer idadeMaximaEmDias;

    @Column(name = "intervalo_minimo_doses_dias")
    private Integer intervaloMinimoDosesEmDias;

    @Column(name = "numero_doses_esquema")
    private Integer numeroDosesEsquema;

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