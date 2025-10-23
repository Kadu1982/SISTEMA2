package com.sistemadesaude.backend.prontuario.entity;

import com.sistemadesaude.backend.prontuario.enums.TipoDocumento;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

/**
 * Entidade de anexos do Prontuário.
 *
 * ⚠️ Ponto crítico do seu erro atual:
 *    Alguns ambientes com Hibernate 6 precisam de dica explícita para bindar byte[] como binário no Postgres.
 *    Por isso adicionamos @JdbcTypeCode(SqlTypes.BINARY) no campo arquivoPdf, mantendo @Lob.
 *    Isso evita o "Unable to bind parameter #3 - [B@...".
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "prontuario_documentos",
        indexes = {
                @Index(name = "idx_pront_doc_paciente", columnList = "paciente_id"),
                @Index(name = "idx_pront_doc_tipo", columnList = "tipo")
        }
)
public class ProntuarioDocumento {

    /** Chave primária (BIGSERIAL no Postgres). */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Tipo do documento: ATESTADO, RECEITUARIO, SADT, COMPROVANTE_AGENDAMENTO, etc. */
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 32)
    private TipoDocumento tipo;

    /**
     * Identificador do paciente no seu domínio.
     * A migration define VARCHAR(50), então mantemos String aqui para compatibilidade.
     */
    @Column(name = "paciente_id", nullable = false, length = 50)
    private String pacienteId;

    /**
     * Opcional: ID textual do atendimento, conforme sua modelagem (VARCHAR(50) na migration).
     * Para comprovante de AGENDAMENTO, geralmente fica null.
     */
    @Column(name = "atendimento_id", length = 50)
    private String atendimentoId;

    /**
     * Opcional: relaciona ao agendamento (BIGINT).
     * Para SADT/Atestado gerados dentro de um atendimento, normalmente fica null.
     */
    @Column(name = "agendamento_id")
    private Long agendamentoId;

    /**
     * Qualquer número de referência que você deseje persistir (ex.: número do SADT, ID do agendamento, etc.).
     */
    @Column(name = "numero_referencia", length = 64)
    private String numeroReferencia;

    /** Nome amigável do arquivo, exibido no download. */
    @Column(name = "arquivo_nome", nullable = false, length = 120)
    private String arquivoNome;

    /** Content-Type HTTP (application/pdf). */
    @Column(name = "content_type", length = 80)
    private String contentType;

    /**
     * ► O PRÓPRIO PDF EM BANCO (LOB).
     *    - @Lob: indica Large OBject
     *    - @JdbcTypeCode(SqlTypes.BINARY): força o Hibernate a bindar byte[] como binário para Postgres (evita erro do parâmetro #3)
     *    - columnDefinition = "bytea": compatível com sua migration já existente
     */
    @Lob
    @Basic(fetch = FetchType.LAZY)
    @JdbcTypeCode(SqlTypes.BINARY) // <<< chave para evitar "Unable to bind parameter #3 - [B@..."
    @Column(name = "arquivo_pdf", columnDefinition = "bytea", nullable = false)
    private byte[] arquivoPdf;

    /** Timestamp de criação (gerado no banco). */
    @CreationTimestamp
    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm;

    /** Opcional: Operador que gerou o documento (para auditoria). */
    @Column(name = "criado_por_operador_id")
    private Long criadoPorOperadorId;
}
