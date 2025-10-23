package com.sistemadesaude.backend.hospitalar.entity;

import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.operador.entity.Operador;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "hospitalar_pre_internacoes")
public class PreInternacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relacionamentos principais
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operador_criacao_id", nullable = false)
    private Operador operadorCriacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leito_reservado_id")
    private Leito leitoReservado;

    // Dados conforme documento
    @Column(name = "numero_pre_internacao", unique = true, nullable = false)
    private String numeroPreInternacao;

    @Column(name = "telefone_paciente")
    private String telefonePaciente;

    @Column(name = "codigo_aviso_cirurgia")
    private String codigoAvisoCirurgia;

    @Column(name = "data_previsao_internacao", nullable = false)
    private LocalDate dataPrevisaoInternacao;

    @Column(name = "hora_previsao_internacao")
    private LocalTime horaPrevisaoInternacao;

    @Column(name = "cidade_paciente")
    private String cidadePaciente;

    @Column(name = "data_previsao_alta")
    private LocalDate dataPrevisaoAlta;

    @Enumerated(EnumType.STRING)
    @Column(name = "origem", nullable = false)
    private OrigemPreInternacao origem;

    @Column(name = "medico_responsavel_id", nullable = false)
    private Long medicoResponsavelId;

    @Column(name = "nome_medico_responsavel")
    private String nomeMedicoResponsavel;

    @Column(name = "especialidade_id")
    private Long especialidadeId;

    @Column(name = "nome_especialidade")
    private String nomeEspecialidade;

    @Column(name = "convenio_id")
    private Long convenioId;

    @Column(name = "nome_convenio")
    private String nomeConvenio;

    @Column(name = "plano_convenio")
    private String planoConvenio;

    @Column(name = "numero_carteirinha")
    private String numeroCarteirinha;

    @Column(name = "procedimento_principal")
    private String procedimentoPrincipal;

    @Column(name = "codigo_procedimento")
    private String codigoProcedimento;

    @Column(name = "cid_principal")
    private String cidPrincipal;

    @Column(name = "descricao_cid")
    private String descricaoCid;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_acomodacao", nullable = false)
    private TipoAcomodacao tipoAcomodacao;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_internacao", nullable = false)
    private TipoPreInternacao tipoInternacao;

    @Column(name = "servico_id")
    private Long servicoId;

    @Column(name = "nome_servico")
    private String nomeServico;

    @Column(name = "unidade_id", nullable = false)
    private Long unidadeId;

    @Column(name = "nome_unidade")
    private String nomeUnidade;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    // Status da pré-internação
    @Enumerated(EnumType.STRING)
    @Column(name = "status_pre_internacao", nullable = false)
    private StatusPreInternacao statusPreInternacao = StatusPreInternacao.AGUARDANDO;

    // Dados complementares
    @Column(name = "regime_internacao")
    @Enumerated(EnumType.STRING)
    private RegimeInternacao regimeInternacao;

    @Column(name = "carater_internacao")
    @Enumerated(EnumType.STRING)
    private CaraterInternacao caraterInternacao;

    @Column(name = "enfermaria_preferida")
    private String enfermariaPreferida;

    @Column(name = "exige_leito_especifico")
    private Boolean exigeLeitoEspecifico = false;

    @Column(name = "tipo_leito_necessario")
    @Enumerated(EnumType.STRING)
    private TipoAcomodacao tipoLeitoNecessario;


    @Column(name = "precisa_isolamento")
    private Boolean precisaIsolamento = false;

    @Column(name = "permite_acompanhante")
    private Boolean permiteAcompanhante = false;

    // Solicitação de reserva de leito
    @Column(name = "solicitou_reserva_leito")
    private Boolean solicitouReservaLeito = false;

    @Column(name = "data_solicitacao_leito")
    private LocalDateTime dataSolicitacaoLeito;

    @Column(name = "data_reserva_leito")
    private LocalDateTime dataReservaLeito;

    @Column(name = "motivo_reserva_leito", columnDefinition = "TEXT")
    private String motivoReservaLeito;

    // Integração com agendamento cirúrgico
    @Column(name = "agendamento_cirurgia_id")
    private Long agendamentoCirurgiaId;

    @Column(name = "data_cirurgia")
    private LocalDate dataCirurgia;

    @Column(name = "hora_cirurgia")
    private LocalTime horaCirurgia;

    // Integração com urgência/emergência
    @Column(name = "atendimento_urgencia_id")
    private Long atendimentoUrgenciaId;

    @Column(name = "prescricao_internacao_id")
    private Long prescricaoInternacaoId;

    // Controle de pendências
    @Column(name = "tem_pendencias")
    private Boolean temPendencias = false;

    @Column(name = "descricao_pendencias", columnDefinition = "TEXT")
    private String descricaoPendencias;

    // Dados da efetivação da internação
    @Column(name = "internacao_efetivada_id")
    private Long internacaoEfetivadaId;

    @Column(name = "data_efetivacao")
    private LocalDateTime dataEfetivacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operador_efetivacao_id")
    private Operador operadorEfetivacao;

    // Auditoria
    @CreationTimestamp
    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao;

    @UpdateTimestamp
    @Column(name = "data_ultima_alteracao")
    private LocalDateTime dataUltimaAlteracao;

    // Enums

    public enum OrigemPreInternacao {
        AGENDAMENTO_CIRURGICO("Agendamento Cirúrgico"),
        URGENCIA_EMERGENCIA("Urgência/Emergência"),
        CLINICA_ELETIVA("Clínica Eletiva"),
        TRANSFERENCIA_EXTERNA("Transferência Externa"),
        RETORNO_INTERNACAO("Retorno de Internação");

        private final String descricao;

        OrigemPreInternacao(String descricao) {
            this.descricao = descricao;
        }

        public String getDescricao() {
            return descricao;
        }
    }

    public enum TipoAcomodacao {
        ENFERMARIA("Enfermaria"),
        APARTAMENTO("Apartamento"),
        QUARTO_DUPLO("Quarto Duplo"),
        UTI("UTI"),
        SEMI_UTI("Semi-UTI"),
        ISOLAMENTO("Isolamento");

        private final String descricao;

        TipoAcomodacao(String descricao) {
            this.descricao = descricao;
        }

        public String getDescricao() {
            return descricao;
        }
    }

    public enum TipoPreInternacao {
        CLINICA("Clínica"),
        CIRURGICA("Cirúrgica"),
        OBSTETRICA("Obstétrica"),
        PEDIATRICA("Pediátrica"),
        PSIQUIATRICA("Psiquiátrica"),
        UTI("UTI"),
        URGENCIA("Urgência"),
        ELETIVA("Eletiva");

        private final String descricao;

        TipoPreInternacao(String descricao) {
            this.descricao = descricao;
        }

        public String getDescricao() {
            return descricao;
        }
    }

    public enum StatusPreInternacao {
        AGUARDANDO("Aguardando Internação"),
        LEITO_RESERVADO("Leito Reservado"),
        CONFIRMADA("Confirmada"),
        EFETIVADA("Efetivada"),
        CANCELADA("Cancelada"),
        VENCIDA("Vencida"),
        TRANSFERIDA("Transferida");

        private final String descricao;

        StatusPreInternacao(String descricao) {
            this.descricao = descricao;
        }

        public String getDescricao() {
            return descricao;
        }
    }

    public enum RegimeInternacao {
        PUBLICO("Público"),
        PARTICULAR("Particular"),
        CONVENIO("Convênio"),
        SUS("SUS");

        private final String descricao;

        RegimeInternacao(String descricao) {
            this.descricao = descricao;
        }

        public String getDescricao() {
            return descricao;
        }
    }

    public enum CaraterInternacao {
        ELETIVA("Eletiva"),
        URGENCIA("Urgência"),
        EMERGENCIA("Emergência");

        private final String descricao;

        CaraterInternacao(String descricao) {
            this.descricao = descricao;
        }

        public String getDescricao() {
            return descricao;
        }
    }

    // Métodos auxiliares

    public boolean isAguardando() {
        return StatusPreInternacao.AGUARDANDO.equals(this.statusPreInternacao);
    }

    public boolean temLeitoReservado() {
        return leitoReservado != null || StatusPreInternacao.LEITO_RESERVADO.equals(this.statusPreInternacao);
    }

    public boolean podeSerEfetivada() {
        return StatusPreInternacao.CONFIRMADA.equals(this.statusPreInternacao) ||
               StatusPreInternacao.LEITO_RESERVADO.equals(this.statusPreInternacao);
    }

    public boolean isVencida() {
        return StatusPreInternacao.VENCIDA.equals(this.statusPreInternacao) ||
               (dataPrevisaoInternacao != null && dataPrevisaoInternacao.isBefore(LocalDate.now()));
    }

    public boolean precisaCentralLeitos() {
        return Boolean.TRUE.equals(exigeLeitoEspecifico) ||
               Boolean.TRUE.equals(precisaIsolamento) ||
               tipoLeitoNecessario != null;
    }

    public boolean isOrigemCirurgica() {
        return OrigemPreInternacao.AGENDAMENTO_CIRURGICO.equals(this.origem);
    }

    public boolean isOrigemUrgencia() {
        return OrigemPreInternacao.URGENCIA_EMERGENCIA.equals(this.origem);
    }

    public String getResumoPreInternacao() {
        StringBuilder sb = new StringBuilder();
        sb.append(paciente != null ? paciente.getNomeCompleto() : "Paciente não identificado");
        sb.append(" - ");
        sb.append(origem.getDescricao());
        sb.append(" - ");
        sb.append(dataPrevisaoInternacao);
        if (tipoInternacao != null) {
            sb.append(" - ").append(tipoInternacao.getDescricao());
        }
        return sb.toString();
    }
}