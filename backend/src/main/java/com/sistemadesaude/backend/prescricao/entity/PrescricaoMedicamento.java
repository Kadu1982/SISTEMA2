package com.sistemadesaude.backend.prescricao.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entidade que representa uma prescrição de medicamento detalhada
 * Armazena todas as informações necessárias para prescrição médica completa
 */
@Entity
@Table(name = "prescricoes_medicamentos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class PrescricaoMedicamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    /**
     * ID do atendimento ao qual esta prescrição pertence
     */
    @Column(name = "atendimento_id", nullable = false)
    private Long atendimentoId;

    /**
     * Tipo de prescrição: INTERNO (na unidade) ou EXTERNO (para casa)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_prescricao", nullable = false, length = 20)
    private TipoPrescricao tipoPrescricao;

    /**
     * Código do medicamento (ex: código REMUME)
     */
    @Column(name = "medicamento_codigo", length = 50)
    private String medicamentoCodigo;

    /**
     * Nome completo do medicamento
     */
    @Column(name = "medicamento_nome", nullable = false, length = 500)
    private String medicamentoNome;

    /**
     * ID do princípio ativo (referência)
     */
    @Column(name = "principio_ativo_id")
    private Long principioAtivoId;

    /**
     * Nome do princípio ativo
     */
    @Column(name = "principio_ativo", nullable = false, length = 300)
    private String principioAtivo;

    /**
     * Número da receita (para controle de receitas controladas)
     */
    @Column(name = "numero_receita")
    private Integer numeroReceita;

    /**
     * Indica se é medicamento controlado
     */
    @Column(name = "medicamento_controlado", nullable = false)
    @Builder.Default
    private Boolean medicamentoControlado = false;

    /**
     * Quantidade prescrita
     */
    @Column(name = "quantidade", precision = 10, scale = 2)
    private BigDecimal quantidade;

    /**
     * Unidade de medida (COM, ML, MG, etc)
     */
    @Column(name = "unidade", length = 20)
    private String unidade;

    /**
     * Via de administração (VO, IV, IM, SC, etc)
     */
    @Column(name = "via_administracao", length = 50)
    private String viaAdministracao;

    /**
     * Data e hora inicial do tratamento
     */
    @Column(name = "data_hora_inicial")
    private LocalDateTime dataHoraInicial;

    /**
     * Data e hora final do tratamento
     */
    @Column(name = "data_hora_final")
    private LocalDateTime dataHoraFinal;

    /**
     * Duração do tratamento em dias
     */
    @Column(name = "duracao_dias")
    private Integer duracaoDias;

    /**
     * Aprazamento (ex: "8/8 H", "12/12 H", "1X AO DIA")
     */
    @Column(name = "aprazamento", length = 50)
    private String aprazamento;

    /**
     * Instrução de dosagem gerada (ex: "1 CP VO DE 8/8 H POR 7 DIAS")
     */
    @Column(name = "instrucao_dosagem", columnDefinition = "TEXT")
    private String instrucaoDosagem;

    /**
     * Observações adicionais sobre a prescrição
     */
    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    /**
     * Ordem da prescrição no atendimento (para ordenação)
     */
    @Column(name = "ordem")
    @Builder.Default
    private Integer ordem = 0;

    /**
     * Indica se a prescrição está ativa
     */
    @Column(name = "ativo", nullable = false)
    @Builder.Default
    private Boolean ativo = true;

    @CreationTimestamp
    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    @UpdateTimestamp
    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    /**
     * Enum para tipo de prescrição
     */
    public enum TipoPrescricao {
        INTERNO,  // Prescrição para uso na unidade
        EXTERNO   // Prescrição para uso em casa
    }
}

