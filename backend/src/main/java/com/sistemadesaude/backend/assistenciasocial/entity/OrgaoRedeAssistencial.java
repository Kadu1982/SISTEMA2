package com.sistemadesaude.backend.assistenciasocial.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Classe entidade que representa um órgão da rede assistencial.
 */
@Entity
@Table(name = "orgaos_rede_assistencial")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrgaoRedeAssistencial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(name = "cnpj")
    private String cnpj;

    @Column(name = "telefone")
    private String telefone;

    // Endereço
    private String municipio;
    private String cep;
    private String logradouro;
    private String numero;
    private String bairro;
    private String complemento;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

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
}
