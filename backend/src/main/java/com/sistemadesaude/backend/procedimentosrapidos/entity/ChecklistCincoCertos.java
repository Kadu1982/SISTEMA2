package com.sistemadesaude.backend.procedimentosrapidos.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidade que representa o Checklist dos 5 Certos
 * Obrigatório para administração de medicamentos conforme normas do COFEN
 * 
 * Os 5 Certos:
 * 1. Paciente certo
 * 2. Medicamento certo
 * 3. Dose certa
 * 4. Via certa
 * 5. Horário certo
 */
@Entity
@Table(name = "checklist_cinco_certos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"atividadeEnfermagem"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ChecklistCincoCertos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @OneToOne
    @JoinColumn(name = "atividade_enfermagem_id", nullable = false, unique = true)
    private AtividadeEnfermagem atividadeEnfermagem;

    @Column(name = "paciente_certo")
    private Boolean pacienteCerto;

    @Column(name = "medicamento_certo")
    private Boolean medicamentoCerto;

    @Column(name = "dose_certa")
    private Boolean doseCerta;

    @Column(name = "via_certa")
    private Boolean viaCerta;

    @Column(name = "horario_certo")
    private Boolean horarioCerto;

    @CreationTimestamp
    @Column(name = "data_validacao", nullable = false, updatable = false)
    private LocalDateTime dataValidacao;

    /**
     * Verifica se o checklist está completo (todos os 5 campos TRUE)
     * @return true se todos os campos forem TRUE, false caso contrário
     */
    @Transient
    public boolean isCompleto() {
        return Boolean.TRUE.equals(pacienteCerto) &&
               Boolean.TRUE.equals(medicamentoCerto) &&
               Boolean.TRUE.equals(doseCerta) &&
               Boolean.TRUE.equals(viaCerta) &&
               Boolean.TRUE.equals(horarioCerto);
    }

    /**
     * Retorna lista de campos que não foram validados (null ou false)
     * @return Lista com nomes dos campos não validados
     */
    @Transient
    public List<String> getCamposNaoValidados() {
        List<String> campos = new ArrayList<>();
        
        if (!Boolean.TRUE.equals(pacienteCerto)) {
            campos.add("pacienteCerto");
        }
        if (!Boolean.TRUE.equals(medicamentoCerto)) {
            campos.add("medicamentoCerto");
        }
        if (!Boolean.TRUE.equals(doseCerta)) {
            campos.add("doseCerta");
        }
        if (!Boolean.TRUE.equals(viaCerta)) {
            campos.add("viaCerta");
        }
        if (!Boolean.TRUE.equals(horarioCerto)) {
            campos.add("horarioCerto");
        }
        
        return campos;
    }
}
