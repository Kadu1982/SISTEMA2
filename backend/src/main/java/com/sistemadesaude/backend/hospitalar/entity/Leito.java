package com.sistemadesaude.backend.hospitalar.entity;

import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.unidadesaude.entity.UnidadeSaude;
import com.sistemadesaude.backend.operador.entity.Operador;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "leito")
public class Leito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero", nullable = false)
    private String numero;

    @Column(name = "andar")
    private String andar;

    @Column(name = "ala")
    private String ala;

    @Column(name = "enfermaria", nullable = false)
    private String enfermaria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidade_id", nullable = false)
    private UnidadeSaude unidade;

    @Column(name = "setor_id")
    private Long setorId;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_acomodacao")
    private TipoAcomodacao tipoAcomodacao;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private StatusLeito status = StatusLeito.DISPONIVEL;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id")
    private Paciente paciente;

    @Column(name = "atendimento_id")
    private Long atendimentoId;

    @Column(name = "data_ocupacao")
    private LocalDateTime dataOcupacao;

    @Column(name = "data_liberacao")
    private LocalDateTime dataLiberacao;

    @Column(name = "data_limpeza")
    private LocalDateTime dataLimpeza;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_limpeza_necessaria")
    private TipoLimpeza tipoLimpezaNecessaria;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_limpeza")
    private StatusLimpeza statusLimpeza = StatusLimpeza.LIMPO;

    @Column(name = "motivo_interdicao")
    private String motivoInterdicao;

    @Column(name = "data_interdicao")
    private LocalDateTime dataInterdicao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsavel_interdicao_id")
    private Operador responsavelInterdicao;

    @Column(name = "observacoes")
    private String observacoes;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Enums conforme migração SQL

    public enum TipoAcomodacao {
        ENFERMARIA("Enfermaria"),
        APARTAMENTO("Apartamento"),
        UTI("UTI"),
        SEMI_UTI("Semi-UTI"),
        ISOLAMENTO("Isolamento");

        private final String descricao;

        TipoAcomodacao(String descricao) {
            this.descricao = descricao;
        }

        public String getDescricao() {
            return descricao;
        }
    }

    public enum StatusLeito {
        DISPONIVEL("Disponível"),
        OCUPADO("Ocupado"),
        RESERVADO("Reservado"),
        INTERDITADO("Interditado"),
        MANUTENCAO("Manutenção"),
        LIMPEZA("Em Limpeza");

        private final String descricao;

        StatusLeito(String descricao) {
            this.descricao = descricao;
        }

        public String getDescricao() {
            return descricao;
        }
    }

    public enum TipoLimpeza {
        TERMINAL("Terminal"),
        CONCORRENTE("Concorrente"),
        DESINFECCAO("Desinfecção");

        private final String descricao;

        TipoLimpeza(String descricao) {
            this.descricao = descricao;
        }

        public String getDescricao() {
            return descricao;
        }
    }

    public enum StatusLimpeza {
        LIMPO("Limpo"),
        SUJO("Sujo"),
        EM_LIMPEZA("Em Limpeza"),
        AGUARDANDO_LIMPEZA("Aguardando Limpeza");

        private final String descricao;

        StatusLimpeza(String descricao) {
            this.descricao = descricao;
        }

        public String getDescricao() {
            return descricao;
        }
    }

    // Métodos auxiliares

    public boolean isDisponivel() {
        return StatusLeito.DISPONIVEL.equals(this.status) && Boolean.TRUE.equals(this.ativo);
    }

    public boolean isOcupado() {
        return StatusLeito.OCUPADO.equals(this.status);
    }

    public boolean isReservado() {
        return StatusLeito.RESERVADO.equals(this.status);
    }

    public boolean isBloqueado() {
        return StatusLeito.INTERDITADO.equals(this.status) ||
               StatusLeito.MANUTENCAO.equals(this.status);
    }

    public boolean podeReceberPaciente() {
        return isDisponivel() && StatusLimpeza.LIMPO.equals(this.statusLimpeza);
    }

    public String getLocalizacaoCompleta() {
        StringBuilder sb = new StringBuilder();
        sb.append(enfermaria);
        if (andar != null && !andar.isEmpty()) {
            sb.append(" - ").append(andar).append("º Andar");
        }
        if (ala != null && !ala.isEmpty()) {
            sb.append(" - Ala ").append(ala);
        }
        sb.append(" - Leito ").append(numero);
        return sb.toString();
    }

    public String getStatusDescricao() {
        if (status != null) {
            return status.getDescricao();
        }
        return "Status indefinido";
    }

    public boolean precisaLimpeza() {
        return StatusLimpeza.SUJO.equals(this.statusLimpeza) ||
               StatusLimpeza.AGUARDANDO_LIMPEZA.equals(this.statusLimpeza);
    }

    public boolean emLimpeza() {
        return StatusLeito.LIMPEZA.equals(this.status) ||
               StatusLimpeza.EM_LIMPEZA.equals(this.statusLimpeza);
    }
}