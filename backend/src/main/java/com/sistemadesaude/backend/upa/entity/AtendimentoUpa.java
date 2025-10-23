package com.sistemadesaude.backend.upa.entity;

import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.upa.enums.StatusAtendimento;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/** Atendimento médico realizado após triagem UPA. */
@Entity @Table(name = "upa_atendimentos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AtendimentoUpa {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "upa_id", nullable = false)
    private Upa upa;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "triagem_id", nullable = false)
    private TriagemUpa triagem;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @Column(length = 10, nullable = false)
    private String cid10;

    @Column(columnDefinition = "TEXT") private String anamnese;
    @Column(columnDefinition = "TEXT") private String exameFisico;
    @Column(columnDefinition = "TEXT") private String hipoteseDiagnostica;
    @Column(columnDefinition = "TEXT") private String conduta;
    @Column(columnDefinition = "TEXT") private String prescricao;
    @Column(columnDefinition = "TEXT") private String observacoes;

    private String retorno;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private StatusAtendimento statusAtendimento;

    @CreationTimestamp
    private LocalDateTime criadoEm;
}
