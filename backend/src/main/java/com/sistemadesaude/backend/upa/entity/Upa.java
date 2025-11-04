package com.sistemadesaude.backend.upa.entity;

import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.unidadesaude.entity.UnidadeSaude; // ajuste se o seu pacote for diferente
import com.sistemadesaude.backend.upa.enums.UpaStatus;
import com.sistemadesaude.backend.upa.enums.UpaPrioridade;

import jakarta.persistence.*;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Entidade que mapeia a tabela 'upa'.
 *
 * Nota:
 * - Adicionei métodos de conveniência getPacienteId()/getUnidadeId() porque
 *   seu service chama esses nomes (compatibilidade com código legado).
 * - Também inclui setPacienteId/setUnidadeId que montam um proxy leve
 *   (apenas com o ID) para Paciente/UnidadeSaude quando necessário.
 */
@Entity
@Table(name = "upa")
@EntityListeners(AuditingEntityListener.class)
public class Upa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /* ======================= RELACIONAMENTOS ======================= */

    /** FK: upa.paciente_id -> pacientes.id */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id")
    private Paciente paciente;

    /** FK: upa.unidade_id -> unidades_saude.id */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidade_id")
    private UnidadeSaude unidade;

    /* ========================== CAMPOS ============================== */

    @Column(name = "ativo", nullable = false)
    private boolean ativo = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50)
    private UpaStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "prioridade", length = 50)
    private UpaPrioridade prioridade;

    @Column(name = "motivo", columnDefinition = "text")
    private String motivo;

    @Column(name = "observacoes", columnDefinition = "text")
    private String observacoes;

    @Column(name = "data_hora_registro", nullable = false)
    private LocalDateTime dataHoraRegistro;

    @Column(name = "data_entrada")
    private LocalDate dataEntrada;

    @Column(name = "hora_entrada")
    private LocalTime horaEntrada;

    @LastModifiedDate
    @Column(name = "atualizado_em", nullable = false)
    private LocalDateTime atualizadoEm;

    /* ====================== LIFECYCLE CALLBACKS ===================== */

    @PrePersist
    protected void onCreate() {
        if (dataHoraRegistro == null) {
            dataHoraRegistro = LocalDateTime.now();
        }
        if (atualizadoEm == null) {
            atualizadoEm = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        atualizadoEm = LocalDateTime.now();
    }

    /* ====================== GETTERS / SETTERS ======================= */

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Paciente getPaciente() { return paciente; }
    public void setPaciente(Paciente paciente) { this.paciente = paciente; }

    public UnidadeSaude getUnidade() { return unidade; }
    public void setUnidade(UnidadeSaude unidade) { this.unidade = unidade; }

    /** Padrão JavaBeans para boolean é "isXxx" */
    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }

    public UpaStatus getStatus() { return status; }
    public void setStatus(UpaStatus status) { this.status = status; }

    public UpaPrioridade getPrioridade() { return prioridade; }
    public void setPrioridade(UpaPrioridade prioridade) { this.prioridade = prioridade; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }

    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }

    public LocalDateTime getDataHoraRegistro() { return dataHoraRegistro; }
    public void setDataHoraRegistro(LocalDateTime dataHoraRegistro) { this.dataHoraRegistro = dataHoraRegistro; }

    public LocalDate getDataEntrada() { return dataEntrada; }
    public void setDataEntrada(LocalDate dataEntrada) { this.dataEntrada = dataEntrada; }

    public LocalTime getHoraEntrada() { return horaEntrada; }
    public void setHoraEntrada(LocalTime horaEntrada) { this.horaEntrada = horaEntrada; }

    public LocalDateTime getAtualizadoEm() { return atualizadoEm; }
    public void setAtualizadoEm(LocalDateTime atualizadoEm) { this.atualizadoEm = atualizadoEm; }

    /* =================== CONVENIENCE METHODS ======================== */
    /* Compatibilidade com serviços/DTOs que usam *_Id diretamente      */

    /** Retorna o ID do paciente sem precisar acessar o objeto. */
    @Transient
    public Long getPacienteId() {
        return (this.paciente != null ? this.paciente.getId() : null);
    }

    /** Permite setar apenas o ID do paciente (monta um proxy leve). */
    public void setPacienteId(Long pacienteId) {
        if (pacienteId == null) {
            this.paciente = null;
        } else {
            Paciente p = new Paciente();
            p.setId(pacienteId);
            this.paciente = p;
        }
    }

    /** Retorna o ID da unidade sem precisar acessar o objeto. */
    @Transient
    public Long getUnidadeId() {
        return (this.unidade != null ? this.unidade.getId() : null);
    }

    /** Permite setar apenas o ID da unidade (monta um proxy leve). */
    public void setUnidadeId(Long unidadeId) {
        if (unidadeId == null) {
            this.unidade = null;
        } else {
            UnidadeSaude u = new UnidadeSaude();
            u.setId(unidadeId);
            this.unidade = u;
        }
    }
}
