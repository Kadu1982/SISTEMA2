package com.sistemadesaude.backend.assistenciasocial.entity;

import com.sistemadesaude.backend.paciente.entity.Paciente;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Classe entidade que representa uma pessoa acolhida em uma família acolhedora.
 */
@Entity
@Table(name = "pessoas_acolhidas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PessoaAcolhida {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "familia_id", nullable = false)
    private Familia familia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @Column(name = "orfao")
    private Boolean orfao;

    @Column(name = "data_acolhimento", nullable = false)
    private LocalDate dataAcolhimento;

    @Column(name = "data_desligamento")
    private LocalDate dataDesligamento;

    @Column(name = "destituido_poder_familiar")
    private Boolean destituidoPoderFamiliar;

    @Column(name = "medida_protecao")
    private String medidaProtecao;

    @Column(name = "cuidados_especiais")
    private Boolean cuidadosEspeciais;

    @Column(name = "descricao_cuidados_especiais", columnDefinition = "TEXT")
    private String descricaoCuidadosEspeciais;

    @Column(name = "valor_beneficio", precision = 10, scale = 2)
    private BigDecimal valorBeneficio;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "data_cadastro")
    private LocalDateTime dataCadastro;

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @Column(name = "usuario_cadastro")
    private String usuarioCadastro;

    @Column(name = "usuario_atualizacao")
    private String usuarioAtualizacao;
}
