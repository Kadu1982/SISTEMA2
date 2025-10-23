package com.sistemadesaude.backend.estoque.entity;

import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.profissional.entity.Profissional;
import com.sistemadesaude.backend.estoque.enums.TipoSaida;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "est_saida")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Saida {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false) private LocalArmazenamento local;
    @ManyToOne(optional = false) private Operacao operacao;

    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    private TipoSaida tipoSaida;

    private LocalDateTime dataHora;

    /** Campos opcionais, conforme tipo de saída no manual */
    @ManyToOne(fetch = FetchType.LAZY) private Paciente paciente;         // Saída para Usuário
    @ManyToOne(fetch = FetchType.LAZY) private Profissional profissional; // Saída para Profissional
    private String setorConsumo;                                          // Consumo Próprio / Ajuste
    private String observacao;

    @OneToMany(mappedBy = "saida", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SaidaItem> itens = new ArrayList<>();
}
