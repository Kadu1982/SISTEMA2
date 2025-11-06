package com.sistemadesaude.backend.procedimentosrapidos.entity;

import com.sistemadesaude.backend.procedimentosrapidos.enums.SituacaoAtividade;
import com.sistemadesaude.backend.procedimentosrapidos.enums.TipoAtividade;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidade que representa uma atividade de enfermagem (medicação, exame, vacina)
 * a ser executada em um paciente dentro do módulo de Procedimentos Rápidos
 */
@Entity
@Table(name = "atividades_enfermagem")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"procedimentoRapido"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class AtividadeEnfermagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "procedimento_rapido_id", nullable = false)
    private ProcedimentoRapido procedimentoRapido;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 50)
    private TipoAtividade tipo;

    @Column(name = "atividade", nullable = false, length = 500)
    private String atividade;

    @Enumerated(EnumType.STRING)
    @Column(name = "situacao", nullable = false, length = 50)
    @Builder.Default
    private SituacaoAtividade situacao = SituacaoAtividade.PENDENTE;

    @Column(name = "data_hora_inicial")
    private LocalDateTime dataHoraInicial;

    @Column(name = "data_hora_final")
    private LocalDateTime dataHoraFinal;

    @Column(name = "profissional", length = 200)
    private String profissional;

    @Column(name = "observacoes", length = 1000)
    private String observacoes;

    @Column(name = "urgente")
    @Builder.Default
    private Boolean urgente = false;

    @Column(name = "alerta", length = 500)
    private String alerta;

    @Column(name = "intervalo_minutos")
    private Integer intervaloMinutos;

    @ElementCollection
    @CollectionTable(
        name = "atividade_horarios",
        joinColumns = @JoinColumn(name = "atividade_id")
    )
    @Column(name = "horario_aprazado")
    @OrderColumn(name = "ordem")
    @Builder.Default
    private List<LocalDateTime> horariosAprazados = new ArrayList<>();

    @ElementCollection
    @CollectionTable(
        name = "atividade_horarios_anteriores",
        joinColumns = @JoinColumn(name = "atividade_id")
    )
    @Column(name = "horario_anterior")
    @OrderColumn(name = "ordem")
    @Builder.Default
    private List<LocalDateTime> horariosAnteriores = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    @UpdateTimestamp
    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    /**
     * Verifica se a atividade está atrasada
     */
    @Transient
    public boolean isAtrasada() {
        if (situacao != SituacaoAtividade.PENDENTE || horariosAprazados.isEmpty()) {
            return false;
        }
        LocalDateTime proximoHorario = horariosAprazados.get(0);
        return LocalDateTime.now().isAfter(proximoHorario);
    }

    /**
     * Retorna o próximo horário aprazado
     */
    @Transient
    public LocalDateTime getProximoHorario() {
        return horariosAprazados.isEmpty() ? null : horariosAprazados.get(0);
    }

    /**
     * Move o horário atual para histórico e remove da lista de aprazados
     */
    public void registrarHorarioExecutado() {
        if (!horariosAprazados.isEmpty()) {
            LocalDateTime horarioExecutado = horariosAprazados.remove(0);
            if (horariosAnteriores == null) {
                horariosAnteriores = new ArrayList<>();
            }
            horariosAnteriores.add(horarioExecutado);
        }
    }
}
