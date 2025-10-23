package com.sistemadesaude.backend.triagem.entity;

import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.recepcao.entity.Agendamento;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 🏥 ENTIDADE QUE REPRESENTA UMA TRIAGEM (Acolhimento Ambulatorial e UPA)
 *
 * Observações importantes:
 * - Mantém todos os campos já existentes no seu projeto (queixa, sinais vitais, DUM etc.)
 * - Adiciona o campo dataReferenciaAtendimento (LocalDate) para registrar a “data de referência” do acolhimento.
 * - NÃO altera nomes de tabela/colunas já criadas; só acrescenta a nova coluna.
 * - ✅ NOVO: Adicionado método `foiReclassificada()` para corrigir erro de compilação.
 */
@Entity
@Table(name = "triagens")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Triagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relacionamentos principais
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @Column(name = "profissional_id")
    private Long profissionalId;


    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "agendamento_id", nullable = false)
    private Agendamento agendamento;

    // 📌 NOVO: Data de referência do acolhimento ambulatorial
    // Armazenamos somente a data (sem horário), como pede a operação em recepção.
    @Column(name = "data_referencia_atendimento")
    private LocalDate dataReferenciaAtendimento;

    // Carimbo da triagem
    @Column(name = "data_triagem", nullable = false)
    private LocalDateTime dataTriagem = LocalDateTime.now();

    // Campos clínicos
    @Column(name = "queixa_principal", nullable = false, columnDefinition = "TEXT")
    private String queixaPrincipal;

    @Enumerated(EnumType.STRING)
    @Column(name = "motivo_consulta", nullable = false)
    private com.sistemadesaude.backend.triagem.entity.MotivoConsulta motivoConsulta;

    @Enumerated(EnumType.STRING)
    @Column(name = "classificacao_risco")
    private com.sistemadesaude.backend.triagem.entity.ClassificacaoRisco classificacaoRisco;

    @Enumerated(EnumType.STRING)
    @Column(name = "classificacao_original")
    private com.sistemadesaude.backend.triagem.entity.ClassificacaoRisco classificacaoOriginal;

    @Column(name = "protocolo_aplicado")
    private String protocoloAplicado;

    @Column(name = "conduta_sugerida", columnDefinition = "TEXT")
    private String condutaSugerida;

    @Column(name = "diagnosticos_sugeridos", columnDefinition = "TEXT")
    private String diagnosticosSugeridos;

    // Saúde da Mulher
    @Column(name = "dum_informada")
    private LocalDate dumInformada;

    @Column(name = "gestante_informado")
    private Boolean gestanteInformado = false;

    @Column(name = "semanas_gestacao_informadas")
    private Integer semanasGestacaoInformadas;

    // Sinais vitais
    @Column(name = "pressao_arterial")
    private String pressaoArterial;

    @Column(name = "temperatura")
    private Double temperatura;

    @Column(name = "peso")
    private Double peso;

    @Column(name = "altura")
    private Double altura;

    @Column(name = "frequencia_cardiaca")
    private Integer frequenciaCardiaca;

    @Column(name = "frequencia_respiratoria")
    private Integer frequenciaRespiratoria;

    @Column(name = "saturacao_oxigenio")
    private Integer saturacaoOxigenio;

    @Column(name = "escala_dor")
    private Integer escalaDor;

    // Observações gerais
    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "alergias", columnDefinition = "TEXT")
    private String alergias;

    // UPA (quando aplicável)
    @Column(name = "is_upa_triagem")
    private Boolean isUpaTriagem = false;

    // Auditoria básica
    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao = LocalDateTime.now();

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @Column(name = "cancelada")
    private Boolean cancelada = false;

    @PreUpdate
    private void preUpdate() {
        this.dataAtualizacao = LocalDateTime.now();
    }

    // Conveniências
    public boolean isTriagemUpa() {
        return Boolean.TRUE.equals(isUpaTriagem);
    }

    public boolean temClassificacaoRisco() {
        return classificacaoRisco != null;
    }

    // Saúde da Mulher
    public boolean temDumInformada() {
        return dumInformada != null;
    }

    public boolean isGestanteInformado() {
        return Boolean.TRUE.equals(gestanteInformado);
    }

    // ========================================
    // ✅ NOVO MÉTODO - ADICIONADO PARA CORRIGIR ERRO DE COMPILAÇÃO
    // ========================================

    /**
     * ✅ NOVO: Verifica se a triagem foi reclassificada
     * Uma triagem é considerada reclassificada se a classificação original
     * foi registrada e é diferente da classificação de risco final.
     *
     * @return true se a triagem foi reclassificada, false caso contrário.
     */
    public boolean foiReclassificada() {
        return this.classificacaoOriginal != null &&
                this.classificacaoOriginal != this.classificacaoRisco;
    }
}