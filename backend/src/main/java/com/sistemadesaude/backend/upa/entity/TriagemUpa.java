package com.sistemadesaude.backend.upa.entity;

import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.upa.enums.ClassificacaoRisco;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entidade da triagem realizada na UPA.
 * Importante: no seu banco a tabela é 'upa_triagem' (singular).
 * Os campos e tipos abaixo estão alinhados com as colunas que você mostrou no pgAdmin.
 */
@Entity
@Table(name = "upa_triagem") // <- CONFERE com o banco
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TriagemUpa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relações ---------------------------------------------------------------

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "upa_id", nullable = false)
    private Upa upa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    // Campos clínicos --------------------------------------------------------

    @Column(name = "motivo_consulta", columnDefinition = "TEXT")
    private String motivoConsulta;

    @Column(name = "queixa_principal", columnDefinition = "TEXT")
    private String queixaPrincipal;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    private String alergias;

    // No seu banco é uma única coluna "pressao_arterial".
    // Mantive como String por compatibilidade (ex.: "120x80"); troque para Integer se for numérico.
    @Column(name = "pressao_arterial")
    private String pressaoArterial;

    private Double temperatura;
    private Double peso;
    private Double altura;

    @Column(name = "frequencia_cardiaca")
    private Integer frequenciaCardiaca;

    @Column(name = "frequencia_respiratoria")
    private Integer frequenciaRespiratoria;

    @Column(name = "saturacao_oxigenio")
    private Integer saturacaoOxigenio;

    @Column(name = "escala_dor")
    private Integer escalaDor;

    @Column(name = "dum_informada")
    private LocalDate dumInformada;

    @Column(name = "gestante_informado")
    private Boolean gestanteInformado;

    @Column(name = "semanas_gestacao_informadas")
    private Integer semanasGestacaoInformadas;

    @Enumerated(EnumType.STRING)
    @Column(name = "classificacao_risco")
    private ClassificacaoRisco classificacaoRisco;

    @CreationTimestamp
    @Column(name = "criado_em")
    private LocalDateTime criadoEm;
}
