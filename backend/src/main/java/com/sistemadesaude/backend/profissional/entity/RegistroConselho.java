package com.sistemadesaude.backend.profissional.entity;

import com.sistemadesaude.backend.profissional.enums.ConselhoProfissional;
import jakarta.persistence.*;
import lombok.*;

/**
 * Registro em conselho (pode ser por especialidade, mas aqui fazemos simples).
 */
@Entity
@Table(name = "profissional_registros_conselho")
@Getter @Setter @Builder
@AllArgsConstructor @NoArgsConstructor
public class RegistroConselho {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ConselhoProfissional conselho;

    @Column(nullable = false)
    private String numeroRegistro;

    private String uf; // UF do registro

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profissional_id", nullable = false)
    private Profissional profissional;
}
