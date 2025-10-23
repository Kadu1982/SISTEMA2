package com.sistemadesaude.backend.hospitalar.entity;

import com.sistemadesaude.backend.operador.entity.Operador;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "hospitalar_acompanhantes_internacao")
public class AcompanhanteInternacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "internacao_id", nullable = false)
    private Internacao internacao;

    // Dados pessoais do acompanhante
    @Column(name = "nome_completo", nullable = false)
    private String nomeCompleto;

    @Column(name = "cpf")
    private String cpf;

    @Column(name = "rg")
    private String rg;

    @Column(name = "data_nascimento")
    private LocalDate dataNascimento;

    @Column(name = "telefone")
    private String telefone;

    @Column(name = "email")
    private String email;

    // Relacionamento com paciente
    @Enumerated(EnumType.STRING)
    @Column(name = "grau_parentesco", nullable = false)
    private GrauParentesco grauParentesco;

    @Column(name = "parentesco_outro")
    private String parentescoOutro;

    // Endereço
    @Column(name = "endereco")
    private String endereco;

    @Column(name = "numero")
    private String numero;

    @Column(name = "complemento")
    private String complemento;

    @Column(name = "bairro")
    private String bairro;

    @Column(name = "cidade")
    private String cidade;

    @Column(name = "uf")
    private String uf;

    @Column(name = "cep")
    private String cep;

    // Controle de permanência
    @Column(name = "data_inicio_acompanhamento", nullable = false)
    private LocalDateTime dataInicioAcompanhamento = LocalDateTime.now();

    @Column(name = "data_fim_acompanhamento")
    private LocalDateTime dataFimAcompanhamento;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_acompanhamento", nullable = false)
    private StatusAcompanhamento statusAcompanhamento = StatusAcompanhamento.ATIVO;

    @Column(name = "tipo_acompanhamento")
    @Enumerated(EnumType.STRING)
    private TipoAcompanhamento tipoAcompanhamento;

    // Controle de revezamento
    @Column(name = "permite_revezamento")
    private Boolean permiteRevezamento = false;

    @Column(name = "horario_inicio")
    private String horarioInicio;

    @Column(name = "horario_fim")
    private String horarioFim;

    // Observações e restrições
    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "restricoes_medicas", columnDefinition = "TEXT")
    private String restricoesMedicas;

    @Column(name = "instrucoes_especiais", columnDefinition = "TEXT")
    private String instrucoesEspeciais;

    // Contato de emergência
    @Column(name = "contato_emergencia_nome")
    private String contatoEmergenciaNome;

    @Column(name = "contato_emergencia_telefone")
    private String contatoEmergenciaTelefone;

    @Column(name = "contato_emergencia_parentesco")
    private String contatoEmergenciaParentesco;

    // Responsabilidades
    @Column(name = "responsavel_legal")
    private Boolean responsavelLegal = false;

    @Column(name = "pode_receber_informacoes")
    private Boolean podeReceberInformacoes = true;

    @Column(name = "pode_tomar_decisoes")
    private Boolean podeTomarDecisoes = false;

    // Auditoria
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operador_registro_id", nullable = false)
    private Operador operadorRegistro;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operador_alteracao_id")
    private Operador operadorAlteracao;

    @CreationTimestamp
    @Column(name = "data_registro", nullable = false)
    private LocalDateTime dataRegistro;

    @UpdateTimestamp
    @Column(name = "data_ultima_alteracao")
    private LocalDateTime dataUltimaAlteracao;

    // Enums

    public enum GrauParentesco {
        PAI("Pai"),
        MAE("Mãe"),
        FILHO("Filho(a)"),
        IRMAO("Irmão(ã)"),
        CONJUGE("Cônjuge"),
        COMPANHEIRO("Companheiro(a)"),
        AVO("Avô/Avó"),
        NETO("Neto(a)"),
        TIO("Tio(a)"),
        PRIMO("Primo(a)"),
        SOGRO("Sogro(a)"),
        CUNHADO("Cunhado(a)"),
        GENRO_NORA("Genro/Nora"),
        AMIGO("Amigo(a)"),
        RESPONSAVEL_LEGAL("Responsável Legal"),
        OUTRO("Outro");

        private final String descricao;

        GrauParentesco(String descricao) {
            this.descricao = descricao;
        }

        public String getDescricao() {
            return descricao;
        }
    }

    public enum StatusAcompanhamento {
        ATIVO("Ativo"),
        INATIVO("Inativo"),
        SUSPENSO("Suspenso"),
        FINALIZADO("Finalizado");

        private final String descricao;

        StatusAcompanhamento(String descricao) {
            this.descricao = descricao;
        }

        public String getDescricao() {
            return descricao;
        }
    }

    public enum TipoAcompanhamento {
        INTEGRAL("Integral"),
        DIURNO("Diurno"),
        NOTURNO("Noturno"),
        REVEZAMENTO("Revezamento"),
        VISITA_AUTORIZADA("Visita Autorizada");

        private final String descricao;

        TipoAcompanhamento(String descricao) {
            this.descricao = descricao;
        }

        public String getDescricao() {
            return descricao;
        }
    }

    // Métodos auxiliares

    public boolean isAtivo() {
        return StatusAcompanhamento.ATIVO.equals(this.statusAcompanhamento);
    }

    public boolean isResponsavelLegal() {
        return Boolean.TRUE.equals(this.responsavelLegal);
    }

    public boolean podeReceberInformacoes() {
        return Boolean.TRUE.equals(this.podeReceberInformacoes) && isAtivo();
    }

    public boolean podeTomarDecisoes() {
        return Boolean.TRUE.equals(this.podeTomarDecisoes) && isAtivo();
    }

    public String getDescricaoParentesco() {
        if (GrauParentesco.OUTRO.equals(this.grauParentesco) && parentescoOutro != null) {
            return parentescoOutro;
        }
        return grauParentesco.getDescricao();
    }

    public String getEnderecoCompleto() {
        StringBuilder sb = new StringBuilder();
        if (endereco != null) {
            sb.append(endereco);
            if (numero != null) {
                sb.append(", ").append(numero);
            }
            if (complemento != null && !complemento.isEmpty()) {
                sb.append(" - ").append(complemento);
            }
            if (bairro != null) {
                sb.append(" - ").append(bairro);
            }
            if (cidade != null) {
                sb.append(" - ").append(cidade);
                if (uf != null) {
                    sb.append("/").append(uf);
                }
            }
            if (cep != null) {
                sb.append(" - CEP: ").append(cep);
            }
        }
        return sb.toString();
    }
}