package com.sistemadesaude.backend.paciente.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;

/**
 * Entidade que representa um Paciente no sistema
 */
@Entity
@Table(name = "pacientes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"endereco"}) // Exclui relacionamentos lazy
@EqualsAndHashCode(onlyExplicitlyIncluded = true)

public class Paciente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome_completo", nullable = false, length = 200)
    private String nomeCompleto;

    @Column(name = "nome_social", length = 200)
    private String nomeSocial;

    @Column(name = "nome_mae", length = 200)
    private String nomeMae;

    @Column(name = "cpf", length = 11, unique = true)
    private String cpf;

    @Column(name = "justificativa_ausencia_cpf", length = 500)
    private String justificativaAusenciaCpf;

    @Column(name = "cns", length = 15)
    private String cns;

    @Column(name = "sexo", length = 1)
    private String sexo;

    @Column(name = "data_nascimento")
    private LocalDate dataNascimento;

    @Column(name = "acamado")
    private Boolean acamado;

    @Column(name = "domiciliado")
    private Boolean domiciliado;

    @Column(name = "cond_saude_mental")
    private Boolean condSaudeMental;

    @Column(name = "usa_plantas")
    private Boolean usaPlantas;

    @Column(name = "outras_condicoes", length = 1000)
    private String outrasCondicoes;

    @Column(name = "municipio", length = 100)
    private String municipio;

    @Column(name = "cep", length = 8)
    private String cep;

    @Column(name = "logradouro", length = 200)
    private String logradouro;

    @Column(name = "numero", length = 10)
    private String numero;

    @Column(name = "bairro", length = 100)
    private String bairro;

    @Column(name = "complemento", length = 100)
    private String complemento;

    @Column(name = "telefone_celular", length = 15)
    private String telefoneCelular;

    @Column(name = "telefone_contato", length = 15)
    private String telefoneContato;

    @Column(name = "tipo_sanguineo", length = 3)
    private String tipoSanguineo;

    @Column(name = "rg", length = 20)
    private String rg;

    @Column(name = "orgao_emissor", length = 10)
    private String orgaoEmissor;

    @Column(name = "certidao_nascimento", length = 50)
    private String certidaoNascimento;

    @Column(name = "carteira_trabalho", length = 20)
    private String carteiraTrabalho;

    @Column(name = "titulo_eleitor", length = 15)
    private String tituloEleitor;

    @Column(name = "prontuario_familiar", length = 20)
    private String prontuarioFamiliar;

    @Column(name = "cor_raca", length = 50)
    private String corRaca;

    @Column(name = "etnia", length = 50)
    private String etnia;

    @Column(name = "escolaridade", length = 50)
    private String escolaridade;

    @Column(name = "situacao_familiar", length = 100)
    private String situacaoFamiliar;

    @UpdateTimestamp
    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @Column(name = "data_ultima_menstruacao")
    private LocalDate dataUltimaMenstruacao;



    /**
     * Método auxiliar para obter o endereço como um objeto de valor.
     * Este método normaliza os campos de endereço em um objeto Endereco.
     */
    @Transient
    public Endereco getEndereco() {
        return Endereco.builder()
                .municipio(this.municipio)
                .cep(this.cep)
                .logradouro(this.logradouro)
                .numero(this.numero)
                .bairro(this.bairro)
                .complemento(this.complemento)
                .build();
    }

    /**
     * Método auxiliar para definir o endereço a partir de um objeto de valor.
     * Este método desnormaliza o objeto Endereco nos campos da entidade.
     */
    @Transient
    public void setEndereco(Endereco endereco) {
        if (endereco != null) {
            this.municipio = endereco.getMunicipio();
            this.cep = endereco.getCep();
            this.logradouro = endereco.getLogradouro();
            this.numero = endereco.getNumero();
            this.bairro = endereco.getBairro();
            this.complemento = endereco.getComplemento();
        }
    }

    /**
     * Retorna o nome de exibição (nome social se disponível, senão nome completo)
     */
    @Transient
    public String getNomeExibicao() {
        return nomeSocial != null && !nomeSocial.trim().isEmpty() ? nomeSocial : nomeCompleto;
    }

    /**
     * Verifica se o paciente possui CPF válido
     */
    @Transient
    public boolean temCpfValido() {
        return cpf != null && !cpf.trim().isEmpty() && cpf.length() == 11;
    }

    /**
     * ✅ CORRIGIDO: Calcula a idade corretamente baseada na data de nascimento
     * Usando Period.between() para cálculo preciso que considera dia e mês
     */
    @Transient
    public Integer getIdade() {
        if (dataNascimento == null) return null;
        return Period.between(dataNascimento, LocalDate.now()).getYears();
    }
}
