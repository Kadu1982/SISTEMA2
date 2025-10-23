package com.sistemadesaude.backend.imunizacao.entity;

import com.sistemadesaude.backend.imunizacao.enums.EstrategiaVacinacao;
import com.sistemadesaude.backend.imunizacao.enums.LocalAtendimento;
import com.sistemadesaude.backend.operador.entity.Operador;
import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.profissional.entity.Profissional;
import com.sistemadesaude.backend.unidadesaude.entity.UnidadeSaude;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "imun_aplicacoes_vacinas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AplicacaoVacina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vacina_id", nullable = false)
    private Vacina vacina;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidade_id", nullable = false)
    private UnidadeSaude unidade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profissional_id")
    private Profissional profissional;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operador_id", nullable = false)
    private Operador operador;

    @Column(name = "data_aplicacao", nullable = false)
    private LocalDate dataAplicacao;

    @Column(name = "hora_aplicacao")
    private String horaAplicacao;

    @Enumerated(EnumType.STRING)
    @Column(name = "estrategia_vacinacao", nullable = false)
    private EstrategiaVacinacao estrategiaVacinacao;

    @Enumerated(EnumType.STRING)
    @Column(name = "local_atendimento", nullable = false)
    private LocalAtendimento localAtendimento;

    @Column(name = "dose", length = 50)
    private String dose;

    @Column(name = "lote", length = 50)
    private String lote;

    @Column(name = "fabricante", length = 100)
    private String fabricante;

    @Column(name = "data_validade")
    private LocalDate dataValidade;

    @Column(name = "via_administracao", length = 50)
    private String viaAdministracao;

    @Column(name = "local_aplicacao", length = 100)
    private String localAplicacao;

    @Column(name = "observacoes", length = 500)
    private String observacoes;

    @Column(name = "exportado_esus")
    @Builder.Default
    private Boolean exportadoEsus = false;

    @Column(name = "exportado_sipni")
    @Builder.Default
    private Boolean exportadoSipni = false;

    @Column(name = "exportado_rnds")
    @Builder.Default
    private Boolean exportadoRnds = false;

    @Column(name = "data_exportacao_esus")
    private LocalDateTime dataExportacaoEsus;

    @Column(name = "data_exportacao_sipni")
    private LocalDateTime dataExportacaoSipni;

    @Column(name = "data_exportacao_rnds")
    private LocalDateTime dataExportacaoRnds;

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