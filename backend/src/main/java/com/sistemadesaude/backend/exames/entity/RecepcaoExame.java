package com.sistemadesaude.backend.exames.entity;

import com.sistemadesaude.backend.operador.entity.Operador;
import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.profissional.entity.Profissional;
import com.sistemadesaude.backend.unidadesaude.entity.UnidadeSaude;
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
@Table(name = "lab_recepcao_exame")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecepcaoExame {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_recepcao", unique = true, nullable = false, length = 20)
    private String numeroRecepcao;

    @Column(name = "codigo_barras", unique = true, length = 50)
    private String codigoBarras;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidade_id", nullable = false)
    private UnidadeSaude unidade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profissional_solicitante_id")
    private Profissional profissionalSolicitante;

    @Column(name = "agendamento_id")
    private Long agendamentoId;

    @Column(name = "data_recepcao", nullable = false)
    private LocalDateTime dataRecepcao;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    @Builder.Default
    private StatusRecepcao status = StatusRecepcao.RECEPCIONADO;

    @Column(name = "urgente")
    @Builder.Default
    private Boolean urgente = false;

    @Lob
    @Column(name = "observacoes")
    private String observacoes;

    // Biometria
    @Column(name = "biometria_coletada")
    @Builder.Default
    private Boolean biometriaColetada = false;

    @Column(name = "biometria_template", length = 5000)
    private String biometriaTemplate;

    // Convênio e faturamento
    @Column(name = "convenio_id")
    private Long convenioId;

    @Column(name = "numero_carteirinha", length = 50)
    private String numeroCarteirinha;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_atendimento", length = 20)
    private TipoAtendimento tipoAtendimento;

    // Exames solicitados
    @OneToMany(mappedBy = "recepcao", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ExameRecepcao> exames = new ArrayList<>();

    // Auditoria
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operador_recepcao_id")
    private Operador operadorRecepcao;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum StatusRecepcao {
        RECEPCIONADO,
        AGUARDANDO_COLETA,
        EM_COLETA,
        COLETADO,
        EM_ANALISE,
        FINALIZADO,
        ENTREGUE,
        CANCELADO
    }

    public enum TipoAtendimento {
        SUS,
        PARTICULAR,
        CONVENIO,
        GRATUITO
    }
}