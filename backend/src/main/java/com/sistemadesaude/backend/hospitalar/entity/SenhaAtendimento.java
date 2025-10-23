package com.sistemadesaude.backend.hospitalar.entity;

import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.operador.entity.Operador;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "senha_atendimento")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SenhaAtendimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fila_id", nullable = false)
    private FilaAtendimento fila;

    @Column(name = "numero_senha", nullable = false)
    private String numeroSenha;

    @Column(name = "sequencia", nullable = false)
    private Integer sequencia;

    @Column(name = "tipo_senha")
    @Enumerated(EnumType.STRING)
    private TipoSenha tipoSenha;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id")
    private Paciente paciente;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private StatusSenha status;

    @Column(name = "data_emissao", nullable = false)
    private LocalDateTime dataEmissao;

    @Column(name = "data_chamada")
    private LocalDateTime dataChamada;

    @Column(name = "data_atendimento")
    private LocalDateTime dataAtendimento;

    @Column(name = "data_conclusao")
    private LocalDateTime dataConclusao;

    @Column(name = "posicao_guiche")
    private String posicaoGuiche;

    @Column(name = "sala_consultorio")
    private String salaConsultorio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operador_chamada_id")
    private Operador operadorChamada;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operador_atendimento_id")
    private Operador operadorAtendimento;

    @Column(name = "motivo_cancelamento")
    private String motivoCancelamento;

    @Column(name = "observacoes")
    private String observacoes;

    @PrePersist
    protected void onCreate() {
        if (dataEmissao == null) {
            dataEmissao = LocalDateTime.now();
        }
        if (status == null) {
            status = StatusSenha.AGUARDANDO;
        }
    }

    public enum TipoSenha {
        NORMAL,
        PRIORITARIO_IDOSO,
        PRIORITARIO_PNE,
        PRIORITARIO_GESTANTE,
        PRIORITARIO_LACTANTE
    }

    public enum StatusSenha {
        AGUARDANDO,
        CHAMADA,
        EM_ATENDIMENTO,
        CONCLUIDA,
        CANCELADA,
        NAO_COMPARECEU
    }
}