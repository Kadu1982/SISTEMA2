package com.sistemadesaude.backend.hospitalar.entity;

import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.unidadesaude.entity.UnidadeSaude;
import com.sistemadesaude.backend.operador.entity.Operador;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "controle_acesso")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ControleAcesso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome", nullable = false)
    private String nome;

    @Column(name = "documento", nullable = false)
    private String documento;

    @Column(name = "tipo_documento")
    @Enumerated(EnumType.STRING)
    private TipoDocumento tipoDocumento;

    @Column(name = "tipo_visitante")
    @Enumerated(EnumType.STRING)
    private TipoVisitante tipoVisitante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id")
    private Paciente paciente;

    @Column(name = "grau_parentesco")
    private String grauParentesco;

    @Column(name = "telefone")
    private String telefone;

    @Column(name = "empresa_fornecedor")
    private String empresaFornecedor;

    @Column(name = "setor_destino")
    private String setorDestino;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsavel_liberacao_id")
    private Operador responsavelLiberacao;

    @Column(name = "data_entrada", nullable = false)
    private LocalDateTime dataEntrada;

    @Column(name = "data_saida")
    private LocalDateTime dataSaida;

    @Column(name = "observacoes")
    private String observacoes;

    @Column(name = "numero_cracha")
    private String numeroCracha;

    @Column(name = "foto_path")
    private String fotoPath;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private StatusAcesso status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidade_id")
    private UnidadeSaude unidade;

    @PrePersist
    protected void onCreate() {
        if (dataEntrada == null) {
            dataEntrada = LocalDateTime.now();
        }
        if (status == null) {
            status = StatusAcesso.DENTRO;
        }
    }

    public enum TipoDocumento {
        CPF,
        RG,
        CNH,
        PASSAPORTE
    }

    public enum TipoVisitante {
        VISITANTE,
        ACOMPANHANTE,
        FORNECEDOR,
        PRESTADOR_SERVICO,
        PACIENTE
    }

    public enum StatusAcesso {
        DENTRO,
        SAIU,
        CANCELADO
    }
}