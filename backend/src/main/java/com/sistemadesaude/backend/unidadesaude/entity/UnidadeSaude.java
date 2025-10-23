package com.sistemadesaude.backend.unidadesaude.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidade que representa uma Unidade de Saúde no sistema
 */
@Entity
@Table(name = "unidades_saude")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnidadeSaude {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Código interno da unidade (único)
     */
    @Column(name = "codigo", length = 30, unique = true)
    private String codigo;

    /**
     * Razão Social
     */
    @Column(name = "razao_social", length = 200)
    private String razaoSocial;

    /**
     * Nome Fantasia
     */
    @Column(name = "nome_fantasia", length = 200)
    private String nomeFantasia;

    /**
     * Nome da unidade de saúde (mantido para compatibilidade)
     */
    @Column(name = "nome", nullable = false, length = 200)
    private String nome;

    /**
     * CNPJ da unidade
     */
    @Column(name = "cnpj", length = 14, unique = true)
    private String cnpj;

    /**
     * Código CNES (Cadastro Nacional de Estabelecimentos de Saúde)
     */
    @Column(name = "codigo_cnes", length = 7, nullable = false, unique = true)
    private String codigoCnes;

    /**
     * Tipo da unidade (UBS, Hospital, Clínica, etc.)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false)
    @Builder.Default
    private TipoUnidadeSaude tipo = TipoUnidadeSaude.UBS;

    /**
     * Classificações e metadados do estabelecimento
     */
    @Column(name = "tipo_estabelecimento", length = 100)
    private String tipoEstabelecimento;

    @Column(name = "esfera_administrativa", length = 100)
    private String esferaAdministrativa;

    @Column(name = "atividade_gestao", length = 100)
    private String atividadeGestao;

    @Column(name = "fluxo_clientela", length = 100)
    private String fluxoClientela;

    @Column(name = "turnos_atendimento", length = 100)
    private String turnosAtendimento;

    @Column(name = "natureza_organizacao", length = 100)
    private String naturezaOrganizacao;

    /**
     * Endereço detalhado
     */
    @Column(name = "logradouro", length = 200)
    private String logradouro;

    @Column(name = "numero", length = 20)
    private String numero;

    @Column(name = "complemento", length = 100)
    private String complemento;

    @Column(name = "bairro", length = 100)
    private String bairro;

    @Column(name = "municipio", length = 100)
    private String municipio;

    @Column(name = "uf", length = 2)
    private String uf;

    /**
     * Endereço completo (compatibilidade)
     */
    @Column(name = "endereco", length = 500)
    private String endereco;

    /**
     * CEP da unidade
     */
    @Column(name = "cep", length = 8)
    private String cep;

    /**
     * Cidade onde está localizada (compatibilidade)
     */
    @Column(name = "cidade", length = 100)
    private String cidade;

    /**
     * Estado (UF) compatibilidade
     */
    @Column(name = "estado", length = 2)
    private String estado;

    /**
     * Telefone da unidade
     */
    @Column(name = "telefone", length = 20)
    private String telefone;

    /**
     * Email da unidade
     */
    @Column(name = "email", length = 100)
    private String email;

    /**
     * Se a unidade está ativa no sistema
     */
    @Column(name = "ativa", nullable = false)
    @Builder.Default
    private Boolean ativa = true;

    /**
     * Horário de funcionamento
     */
    @Column(name = "horario_funcionamento", length = 200)
    private String horarioFuncionamento;

    /**
     * Gestor responsável pela unidade
     */
    @Column(name = "gestor_responsavel", length = 100)
    private String gestorResponsavel;

    /**
     * Documentos e convenios vinculados
     */
    @OneToMany(mappedBy = "unidade", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DocumentoUnidade> documentos = new ArrayList<>();

    /**
     * Data de criação do registro
     */
    @CreationTimestamp
    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    /**
     * Data da última atualização
     */
    @UpdateTimestamp
    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    /**
     * Usuário que criou o registro
     */
    @Column(name = "criado_por", length = 50)
    private String criadoPor;

    /**
     * Usuário que fez a última atualização
     */
    @Column(name = "atualizado_por", length = 50)
    private String atualizadoPor;

    // Construtor adicional para facilitar criação
    public UnidadeSaude(String nome, String codigoCnes) {
        this.nome = nome;
        this.codigoCnes = codigoCnes;
        this.ativa = true;
        this.tipo = TipoUnidadeSaude.UBS;
    }

    /**
     * Construtor para criação básica com tipo
     */
    public UnidadeSaude(String nome, String codigoCnes, TipoUnidadeSaude tipo) {
        this.nome = nome;
        this.codigoCnes = codigoCnes;
        this.tipo = tipo;
        this.ativa = true;
    }
}
