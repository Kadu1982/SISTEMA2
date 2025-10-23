package com.sistemadesaude.backend.profissional.entity;

import com.sistemadesaude.backend.profissional.enums.RacaCor;
import com.sistemadesaude.backend.profissional.enums.Sexo;
import com.sistemadesaude.backend.profissional.enums.TipoCadastroProfissional;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidade mestre do cadastro do profissional.
 * Campos alinhados à aba "Profissional" do PDF + metadados úteis.
 */
@Entity
@Table(name = "profissionais")
@Getter @Setter @Builder
@AllArgsConstructor @NoArgsConstructor
public class Profissional {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Dados principais
    @Column(nullable = false, length = 180)
    private String nomeCompleto;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoCadastroProfissional tipoCadastro;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Sexo sexo;

    private LocalDate dataNascimento;

    private String nomeMae;
    private String nomePai;

    private String cns; // CNS do profissional
    private String nacionalidade;
    private String municipioNascimento;
    private LocalDate dataChegadaPais;
    private Boolean naturalizado;
    private String portariaNaturalizacao;

    @Enumerated(EnumType.STRING)
    private RacaCor racaCor;

    private String etnia;

    // Permissões do PDF (exemplos)
    private Boolean permiteSolicitarInsumos;
    private Boolean permiteSolicitarExames;
    private Boolean profissionalVISA;

    // Contatos
    private String telefone;
    private String email;

    // Endereço e Documentos (embutidos)
    @Embedded
    private EnderecoProfissional endereco;

    @Embedded
    private DocumentosProfissional documentos;

    // Data da última atualização CNES (preenchida por job/importador)
    private LocalDate dataAtualizacaoCNES;

    // Flags gerais
    private Boolean ativo;

    // Relações auxiliares
    @OneToMany(mappedBy = "profissional", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RegistroConselho> registrosConselho = new ArrayList<>();

    @OneToMany(mappedBy = "profissional", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProfissionalEspecialidade> especialidades = new ArrayList<>();

    @OneToMany(mappedBy = "profissional", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VinculoProfissionalUnidade> vinculos = new ArrayList<>();

    // Auditoria
    @CreationTimestamp
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    private LocalDateTime atualizadoEm;
}
