package com.sistemadesaude.backend.assistenciasocial.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Classe entidade que representa um serviço socioassistencial.
 */
@Entity
@Table(name = "servicos_socioassistenciais")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServicoSocioassistencial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "quantidade_vagas")
    private Integer quantidadeVagas;

    @Column(name = "trabalhos_sociais_essenciais", columnDefinition = "TEXT")
    private String trabalhosSociaisEssenciais;

    @Column(name = "locais_oferta", columnDefinition = "TEXT")
    private String locaisOferta;

    @Column(name = "ativo")
    private Boolean ativo = true;

    @Column(name = "data_cadastro")
    private LocalDateTime dataCadastro;

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @Column(name = "usuario_cadastro")
    private String usuarioCadastro;

    @Column(name = "usuario_atualizacao")
    private String usuarioAtualizacao;

    @OneToMany(mappedBy = "servico", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GrupoServicoSocioassistencial> grupos = new ArrayList<>();
}
