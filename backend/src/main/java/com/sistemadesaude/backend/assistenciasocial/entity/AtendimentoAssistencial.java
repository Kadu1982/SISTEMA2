package com.sistemadesaude.backend.assistenciasocial.entity;

import com.sistemadesaude.backend.operador.entity.Operador;
import com.sistemadesaude.backend.paciente.entity.Paciente;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Classe entidade que representa um atendimentover assistencial.
 */
@Entity
@Table(name = "atendimentos_assistenciais")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtendimentoAssistencial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tipo_atendimento")
    @Enumerated(EnumType.STRING)
    private TipoAtendimento tipoAtendimento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidade_id", nullable = false)
    private UnidadeAssistencial unidade;

    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "familia_id")
    private Familia familia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "servico_id")
    private ServicoSocioassistencial servico;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grupo_id")
    private GrupoServicoSocioassistencial grupo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "programa_id")
    private ProgramaAssistencial programa;

    @Column(name = "anotacoes", columnDefinition = "TEXT")
    private String anotacoes;

    @Column(name = "sigiloso")
    private Boolean sigiloso = false;

    @Column(name = "data_cadastro")
    private LocalDateTime dataCadastro;

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @Column(name = "usuario_cadastro")
    private String usuarioCadastro;

    @Column(name = "usuario_atualizacao")
    private String usuarioAtualizacao;

    @Column(name = "status")
    private String status;


    @ManyToMany
    @JoinTable(
        name = "atendimentos_assistenciais_pacientes",
        joinColumns = @JoinColumn(name = "atendimento_id"),
        inverseJoinColumns = @JoinColumn(name = "paciente_id")
    )
    private List<Paciente> pacientes = new ArrayList<>();

    @ManyToMany
    @JoinTable(
        name = "atendimentos_assistenciais_profissionais",
        joinColumns = @JoinColumn(name = "atendimento_id"),
        inverseJoinColumns = @JoinColumn(name = "profissional_id")
    )
    private List<Operador> profissionais = new ArrayList<>();

    @ManyToMany
    @JoinTable(
        name = "atendimentos_assistenciais_motivos",
        joinColumns = @JoinColumn(name = "atendimento_id"),
        inverseJoinColumns = @JoinColumn(name = "motivo_id")
    )
    private List<MotivoAtendimento> motivos = new ArrayList<>();

    // Enums
    public enum TipoAtendimento {
        INDIVIDUAL,
        FAMILIAR,
        COLETIVO,
        GRUPO
    }

    // ✅ Adicione uma implementação segura de equals() e hashCode() baseada apenas no ID.
    // Isso é crucial para o bom funcionamento do JPA/Hibernate.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AtendimentoAssistencial that = (AtendimentoAssistencial) o;
        return id != null && Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
