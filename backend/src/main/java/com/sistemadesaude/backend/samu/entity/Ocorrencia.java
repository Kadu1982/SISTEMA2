package com.sistemadesaude.backend.samu.entity;

import com.sistemadesaude.backend.operador.entity.Operador;
import com.sistemadesaude.backend.samu.enums.TipoOcorrencia;
import com.sistemadesaude.backend.samu.enums.StatusOcorrencia;
import com.sistemadesaude.backend.samu.enums.PrioridadeOcorrencia;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "samu_ocorrencia")
public class Ocorrencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_ocorrencia", unique = true, nullable = false)
    private String numeroOcorrencia;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_ocorrencia", nullable = false)
    private TipoOcorrencia tipoOcorrencia;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private StatusOcorrencia status;

    @Enumerated(EnumType.STRING)
    @Column(name = "prioridade", nullable = false)
    private PrioridadeOcorrencia prioridade;

    @Column(name = "telefone_solicitante", nullable = false)
    private String telefoneSolicitante;

    @Column(name = "nome_solicitante")
    private String nomeSolicitante;

    @Column(name = "endereco_completo", nullable = false, columnDefinition = "TEXT")
    private String enderecoCompleto;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "descricao_ocorrencia", nullable = false, columnDefinition = "TEXT")
    private String descricaoOcorrencia;

    @Column(name = "queixa_principal", columnDefinition = "TEXT")
    private String queixaPrincipal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "central_regulacao_id", nullable = false)
    private CentralRegulacao centralRegulacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operador_id", nullable = false)
    private Operador operador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medico_regulador_id")
    private Operador medicoRegulador;

    @OneToMany(mappedBy = "ocorrencia", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PacienteOcorrencia> pacientes = new ArrayList<>();

    @OneToMany(mappedBy = "ocorrencia", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<EventoOcorrencia> eventos = new ArrayList<>();

    @OneToMany(mappedBy = "ocorrencia", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ViaturaOcorrencia> viaturas = new ArrayList<>();

    @Column(name = "data_abertura", nullable = false)
    private LocalDateTime dataAbertura = LocalDateTime.now();

    @Column(name = "data_encerramento")
    private LocalDateTime dataEncerramento;

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao = LocalDateTime.now();

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "recurso_apoio_externo")
    private String recursoApoioExterno;

    @PreUpdate
    private void preUpdate() {
        this.dataAtualizacao = LocalDateTime.now();
    }
}
