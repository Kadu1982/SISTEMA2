package com.sistemadesaude.backend.recepcao.entity;

import com.sistemadesaude.backend.paciente.entity.Paciente;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidade específica para agendamento de exames
 * Baseado no Manual de Agendamento de Exames v5.17.13
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "agendamentos_exames")
public class AgendamentoExame {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @Column(name = "protocolo", unique = true, nullable = false, length = 20)
    private String protocolo;

    @Column(name = "data_agendamento", nullable = false)
    private LocalDateTime dataAgendamento;

    @Column(name = "data_hora_exame", nullable = false)
    private LocalDateTime dataHoraExame;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "horario_exame_id")
    private HorarioExame horarioExame;

    @Column(name = "profissional_id")
    private Long profissionalId;

    @Column(name = "profissional_nome", length = 100)
    private String profissionalNome;

    @Column(name = "sala_id")
    private Long salaId;

    @Column(name = "sala_nome", length = 50)
    private String salaNome;

    @Column(name = "unidade_id", nullable = false)
    private Long unidadeId;

    @Column(name = "unidade_nome", length = 100)
    private String unidadeNome;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private StatusAgendamentoExame status = StatusAgendamentoExame.AGENDADO;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_agendamento", nullable = false)
    private HorarioExame.TipoAgendamentoExame tipoAgendamento = HorarioExame.TipoAgendamentoExame.INTERNO;

    @Column(name = "origem_solicitacao", length = 50)
    private String origemSolicitacao; // AMBULATORIO, INTERNACAO, URGENCIA

    @Column(name = "solicitante_id")
    private Long solicitanteId;

    @Column(name = "solicitante_nome", length = 100)
    private String solicitanteNome;

    @Column(name = "autorizacao_convenio", length = 50)
    private String autorizacaoConvenio;

    @Column(name = "guia_convenio", length = 50)
    private String guiaConvenio;

    /**
     * Lista de exames solicitados neste agendamento
     */
    @ElementCollection
    @CollectionTable(
        name = "agendamento_exame_itens",
        joinColumns = @JoinColumn(name = "agendamento_exame_id")
    )
    private List<ExameAgendado> examesAgendados = new ArrayList<>();

    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "preparacao_paciente", columnDefinition = "TEXT")
    private String preparacaoPaciente;

    @Column(name = "contato_paciente", length = 20)
    private String contatoPaciente;

    @Column(name = "email_paciente", length = 100)
    private String emailPaciente;

    @Column(name = "confirmado")
    private Boolean confirmado = false;

    @Column(name = "data_confirmacao")
    private LocalDateTime dataConfirmacao;

    @Column(name = "usuario_confirmacao", length = 50)
    private String usuarioConfirmacao;

    @Column(name = "encaixe")
    private Boolean encaixe = false;

    @Column(name = "prioridade")
    private Boolean prioridade = false;

    @Column(name = "motivo_cancelamento", columnDefinition = "TEXT")
    private String motivoCancelamento;

    @Column(name = "data_cancelamento")
    private LocalDateTime dataCancelamento;

    @Column(name = "usuario_cancelamento", length = 50)
    private String usuarioCancelamento;

    @Column(name = "data_realizacao")
    private LocalDateTime dataRealizacao;

    @Column(name = "usuario_realizacao", length = 50)
    private String usuarioRealizacao;

    @Column(name = "comprovante_pdf", columnDefinition = "TEXT")
    private String comprovantePdf;

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao = LocalDateTime.now();

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @Column(name = "usuario_criacao", length = 50)
    private String usuarioCriacao;

    @Column(name = "usuario_atualizacao", length = 50)
    private String usuarioAtualizacao;

    /**
     * Status possíveis para agendamento de exames
     */
    public enum StatusAgendamentoExame {
        AGENDADO("Agendado", "primary"),
        CONFIRMADO("Confirmado", "success"),
        AGUARDANDO_ATENDIMENTO("Aguardando Atendimento", "warning"),
        EM_ATENDIMENTO("Em Atendimento", "info"),
        REALIZADO("Realizado", "success"),
        CANCELADO("Cancelado", "danger"),
        NAO_COMPARECEU("Não Compareceu", "warning"),
        REAGENDADO("Reagendado", "secondary");

        private final String descricao;
        private final String cor;

        StatusAgendamentoExame(String descricao, String cor) {
            this.descricao = descricao;
            this.cor = cor;
        }

        public String getDescricao() { return descricao; }
        public String getCor() { return cor; }
    }

    /**
     * Classe embeddable para representar cada exame agendado
     */
    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExameAgendado {
        
        @Column(name = "exame_codigo", length = 50)
        private String exameCodigo;

        @Column(name = "exame_nome", length = 200)
        private String exameNome;

        @Column(name = "categoria", length = 50)
        private String categoria;

        @Column(name = "duracao_estimada")
        private Integer duracaoEstimada; // em minutos

        @Column(name = "requer_preparo")
        private Boolean requerPreparo = false;

        @Column(name = "descricao_preparo", columnDefinition = "TEXT")
        private String descricaoPreparo;

        @Column(name = "observacoes_especificas", columnDefinition = "TEXT")
        private String observacoesEspecificas;

        @Column(name = "material_coleta", length = 100)
        private String materialColeta;

        @Column(name = "quantidade_material")
        private String quantidadeMaterial;
    }

    @PreUpdate
    private void preUpdate() {
        this.dataAtualizacao = LocalDateTime.now();
    }

    // Métodos utilitários

    public boolean podeSerCancelado() {
        return status == StatusAgendamentoExame.AGENDADO || 
               status == StatusAgendamentoExame.CONFIRMADO ||
               status == StatusAgendamentoExame.AGUARDANDO_ATENDIMENTO;
    }

    public boolean podeSerConfirmado() {
        return status == StatusAgendamentoExame.AGENDADO && !confirmado;
    }

    public boolean podeSerRealizado() {
        return status == StatusAgendamentoExame.CONFIRMADO || 
               status == StatusAgendamentoExame.AGUARDANDO_ATENDIMENTO ||
               status == StatusAgendamentoExame.EM_ATENDIMENTO;
    }

    public boolean isAtrasado() {
        return dataHoraExame != null && 
               LocalDateTime.now().isAfter(dataHoraExame) &&
               (status == StatusAgendamentoExame.AGENDADO || status == StatusAgendamentoExame.CONFIRMADO);
    }

    public int getDuracaoTotalEstimada() {
        return examesAgendados.stream()
                .mapToInt(e -> e.getDuracaoEstimada() != null ? e.getDuracaoEstimada() : 30)
                .sum();
    }

    public boolean requerPreparoEspecial() {
        return examesAgendados.stream()
                .anyMatch(e -> Boolean.TRUE.equals(e.getRequerPreparo()));
    }

    public String gerarProtocolo() {
        // Formato: AGE + ANO + MES + DIA + SEQUENCIAL (6 dígitos)
        LocalDateTime agora = LocalDateTime.now();
        return String.format("AGE%04d%02d%02d%06d", 
                agora.getYear(), 
                agora.getMonthValue(), 
                agora.getDayOfMonth(),
                System.currentTimeMillis() % 1000000);
    }
}