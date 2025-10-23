package com.sistemadesaude.backend.recepcao.entity;

import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.triagem.entity.Triagem;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "agendamentos")
public class Agendamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @Column(name = "profissional_id")
    private Long profissionalId;

    @Column(name = "especialidade", length = 100)
    private String especialidade;

    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;

    @Column(name = "data_agendamento", nullable = false)
    private LocalDateTime dataAgendamento;

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao = LocalDateTime.now();

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private StatusAgendamento status = StatusAgendamento.AGENDADO;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_consulta")
    private TipoConsulta tipoConsulta = TipoConsulta.CONSULTA;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "motivo_cancelamento", columnDefinition = "TEXT")
    private String motivoCancelamento;

    @Column(name = "data_cancelamento")
    private LocalDateTime dataCancelamento;

    @Column(name = "operador_cancelamento_id")
    private Long operadorCancelamentoId;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "triagem_id")
    private Triagem triagem;

    @Lob
    @Column(name = "comprovante_pdf_base64", columnDefinition = "TEXT")
    private String comprovantePdfBase64;

    @Column(name = "codigo_barras", unique = true, length = 50)
    private String codigoBarras;

    @Lob
    @Column(name = "codigo_barras_imagem")
    private byte[] codigoBarrasImagem;

    @PreUpdate
    private void preUpdate() {
        this.dataAtualizacao = LocalDateTime.now();
    }

    public boolean isAtivo() {
        return status != StatusAgendamento.CANCELADO;
    }

    public boolean isCancelado() {
        return status == StatusAgendamento.CANCELADO;
    }

    public boolean isConfirmado() {
        return status == StatusAgendamento.CONFIRMADO;
    }

    public boolean isTriado() {
        return triagem != null;
    }

    public boolean podeSerTriado() {
        return status == StatusAgendamento.CONFIRMADO || status == StatusAgendamento.AGENDADO;
    }

    public boolean podeSeCancelar() {
        return status != StatusAgendamento.CANCELADO;
    }

    public boolean isAgendado() {
        return status == StatusAgendamento.AGENDADO;
    }

    public boolean hasTriagem() {
        return triagem != null;
    }

    public LocalDateTime getDataHora() {
        return dataHora != null ? dataHora : dataAgendamento;
    }

    public boolean isConsultaUrgente() {
        return tipoConsulta != null && tipoConsulta.isPrioritario();
    }

    public int getDuracaoEstimada() {
        return tipoConsulta != null ? tipoConsulta.getDuracaoMinutos() : 60;
    }

    public boolean requerSalaEspecializada() {
        return tipoConsulta != null && tipoConsulta.requerSalaEspecializada();
    }

    public String getCorInterface() {
        if (tipoConsulta != null) {
            return tipoConsulta.getCorInterface();
        }
        return status.getCorInterface();
    }

    public String getEspecialidade() {
        return especialidade != null && !especialidade.trim().isEmpty() ? especialidade : "GERAL";
    }

    public boolean isConsultaEspecializada() {
        return especialidade != null &&
                !especialidade.trim().isEmpty() &&
                !"GERAL".equalsIgnoreCase(especialidade.trim());
    }

    public String getCodigoCBO() {
        if (especialidade == null) return "225125";

        return switch (especialidade.toUpperCase()) {
            case "CARDIOLOGIA" -> "225120";
            case "DERMATOLOGIA" -> "225135";
            case "GINECOLOGIA", "GINECOLOGIA_OBSTETRICIA" -> "225250";
            case "NEUROLOGIA" -> "225142";
            case "ORTOPEDIA" -> "225265";
            case "PEDIATRIA" -> "225150";
            case "PSIQUIATRIA" -> "225160";
            case "UROLOGIA" -> "225275";
            case "OFTALMOLOGIA" -> "225145";
            case "OTORRINOLARINGOLOGIA" -> "225148";
            case "ENDOCRINOLOGIA" -> "225137";
            case "GASTROENTEROLOGIA" -> "225139";
            case "PNEUMOLOGIA" -> "225155";
            case "REUMATOLOGIA" -> "225162";
            case "ONCOLOGIA" -> "225144";
            case "HEMATOLOGIA" -> "225141";
            case "INFECTOLOGIA" -> "225143";
            case "NEFROLOGIA" -> "225146";
            case "GERIATRIA" -> "225140";
            case "MEDICINA_FAMILIA" -> "225130";
            case "MEDICINA_TRABALHO" -> "225133";
            case "MEDICINA_ESPORTIVA" -> "225131";
            default -> "225125";
        };
    }

    public boolean requerExamesEspecificos() {
        if (especialidade == null) return false;

        return switch (especialidade.toUpperCase()) {
            case "CARDIOLOGIA", "NEUROLOGIA", "ENDOCRINOLOGIA",
                 "GASTROENTEROLOGIA", "PNEUMOLOGIA", "NEFROLOGIA",
                 "ONCOLOGIA", "HEMATOLOGIA" -> true;
            default -> false;
        };
    }

    public Double getValorBaseConsulta() {
        if (especialidade == null) return 50.0;

        return switch (especialidade.toUpperCase()) {
            case "CARDIOLOGIA", "NEUROLOGIA", "ONCOLOGIA" -> 120.0;
            case "DERMATOLOGIA", "OFTALMOLOGIA", "ORTOPEDIA" -> 100.0;
            case "GINECOLOGIA", "UROLOGIA", "GASTROENTEROLOGIA" -> 90.0;
            case "PEDIATRIA", "GERIATRIA", "MEDICINA_FAMILIA" -> 70.0;
            case "PSIQUIATRIA", "ENDOCRINOLOGIA", "REUMATOLOGIA" -> 110.0;
            case "PNEUMOLOGIA", "NEFROLOGIA", "INFECTOLOGIA" -> 95.0;
            case "OTORRINOLARINGOLOGIA", "HEMATOLOGIA" -> 85.0;
            case "MEDICINA_TRABALHO", "MEDICINA_ESPORTIVA" -> 80.0;
            default -> 50.0;
        };
    }

    public String[] getEquipamentosNecessarios() {
        if (especialidade == null) return new String[]{"ESTETOSCOPIO", "TERMOMETRO", "BALANCA"};

        return switch (especialidade.toUpperCase()) {
            case "CARDIOLOGIA" -> new String[]{"ECG", "ESTETOSCOPIO", "ESFIGMOMANOMETRO", "DESFIBRILADOR"};
            case "OFTALMOLOGIA" -> new String[]{"OFTALMOSCOPIO", "LÂMPADA_FENDA", "TONOMETRO", "REFRATOR"};
            case "OTORRINOLARINGOLOGIA" -> new String[]{"OTOSCOPIO", "RINOFIBROSCOPIO", "AUDIOMETRO"};
            case "DERMATOLOGIA" -> new String[]{"DERMATOSCOPIO", "LÂMPADA_WOOD", "CRIOTERAPIA"};
            case "GINECOLOGIA" -> new String[]{"ESPECULO", "COLPOSCOPIO", "ULTRASSOM_TRANSVAGINAL"};
            case "ORTOPEDIA" -> new String[]{"RAIO_X_PORTATIL", "GONIOMETRO", "MARTELO_REFLEXOS"};
            case "NEUROLOGIA" -> new String[]{"ELETROENCEFALOGRAFO", "MARTELO_REFLEXOS", "OFTALMOSCOPIO"};
            case "PNEUMOLOGIA" -> new String[]{"ESPIROMETRO", "OXIMETRO", "PEAK_FLOW"};
            case "ENDOCRINOLOGIA" -> new String[]{"GLICOSIMETRO", "BALANCA_BIOIMPEDANCIA", "FITA_METRICA"};
            default -> new String[]{"ESTETOSCOPIO", "TERMOMETRO", "BALANCA", "ESFIGMOMANOMETRO"};
        };
    }

    public String getCategoriaEspecialidade() {
        if (especialidade == null) return "CLINICA_GERAL";

        return switch (especialidade.toUpperCase()) {
            case "CARDIOLOGIA", "PNEUMOLOGIA", "GASTROENTEROLOGIA",
                 "ENDOCRINOLOGIA", "NEFROLOGIA", "HEMATOLOGIA",
                 "INFECTOLOGIA", "REUMATOLOGIA" -> "CLINICA_MEDICA";
            case "ORTOPEDIA", "UROLOGIA", "GINECOLOGIA",
                 "OFTALMOLOGIA", "OTORRINOLARINGOLOGIA" -> "CIRURGICA";
            case "PEDIATRIA", "GERIATRIA", "MEDICINA_FAMILIA" -> "ATENCAO_PRIMARIA";
            case "PSIQUIATRIA", "NEUROLOGIA" -> "SAUDE_MENTAL_NEUROLOGICA";
            case "DERMATOLOGIA", "ONCOLOGIA" -> "ESPECIALIZADA";
            case "MEDICINA_TRABALHO", "MEDICINA_ESPORTIVA" -> "MEDICINA_OCUPACIONAL";
            default -> "CLINICA_GERAL";
        };
    }
}
