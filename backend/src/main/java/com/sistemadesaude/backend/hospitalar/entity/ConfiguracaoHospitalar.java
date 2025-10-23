package com.sistemadesaude.backend.hospitalar.entity;

import com.sistemadesaude.backend.unidadesaude.entity.UnidadeSaude;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "configuracao_hospitalar")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConfiguracaoHospitalar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "parametro", nullable = false, unique = true)
    private String parametro;

    @Column(name = "valor", nullable = false)
    private String valor;

    @Column(name = "descricao")
    private String descricao;

    @Column(name = "tipo")
    @Enumerated(EnumType.STRING)
    private TipoParametro tipo;

    @Column(name = "ativo")
    private Boolean ativo = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidade_id")
    private UnidadeSaude unidade;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum TipoParametro {
        PROCEDIMENTO,
        IMPRESSAO,
        SISTEMA,
        CONTROLE_ACESSO,
        CERTIFICADO_DIGITAL,
        MULTI_ESTABELECIMENTO
    }
}