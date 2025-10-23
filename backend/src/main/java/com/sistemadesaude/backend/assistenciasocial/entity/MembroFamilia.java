package com.sistemadesaude.backend.assistenciasocial.entity;

import com.sistemadesaude.backend.paciente.entity.Paciente;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Classe entidade que representa um membro de uma família no módulo de Assistência Social.
 */
@Entity
@Table(name = "membros_familia")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MembroFamilia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "familia_id", nullable = false)
    private Familia familia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @Column(name = "parentesco", nullable = false)
    private String parentesco;

    @Column(name = "data_entrada")
    private LocalDateTime dataEntrada;

    @Column(name = "data_saida")
    private LocalDateTime dataSaida;

    @Column(name = "motivo_saida")
    private String motivoSaida;

    @Column(name = "responsavel_familia")
    private Boolean responsavelFamilia = false;

    @Column(name = "data_cadastro")
    private LocalDateTime dataCadastro;

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @Column(name = "usuario_cadastro")
    private String usuarioCadastro;

    @Column(name = "usuario_atualizacao")
    private String usuarioAtualizacao;
}
