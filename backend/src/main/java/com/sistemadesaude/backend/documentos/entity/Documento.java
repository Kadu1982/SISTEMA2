package com.sistemadesaude.backend.documentos.entity;

import com.sistemadesaude.backend.paciente.entity.Paciente;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entidade para armazenar metadados dos documentos PDF gerados no sistema.
 * CONFORME ISSUE: Persistir PDFs gerados para reimpressão com metadados completos.
 * 
 * Estrutura conforme especificado na issue:
 * - id, tipo, paciente_id, caminho_arquivo, hash, created_at
 */
@Entity
@Table(name = "documentos", indexes = {
    @Index(name = "idx_documentos_paciente", columnList = "paciente_id"),
    @Index(name = "idx_documentos_tipo", columnList = "tipo"),
    @Index(name = "idx_documentos_created", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Documento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    /**
     * Tipo do documento: ATESTADO, RECEITUARIO, COMPROVANTE
     */
    @Column(name = "tipo", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private TipoDocumento tipo;

    /**
     * Referência ao paciente proprietário do documento
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    /**
     * Caminho do arquivo PDF no sistema de arquivos
     * Ex: storage/documentos/atestado/2024/09/123.pdf
     */
    @Column(name = "caminho_arquivo", nullable = false, length = 500)
    private String caminhoArquivo;

    /**
     * Hash SHA-256 do conteúdo do PDF para integridade
     */
    @Column(name = "hash", nullable = false, length = 64)
    private String hash;

    /**
     * Nome original do arquivo sugerido para download
     */
    @Column(name = "nome_arquivo", length = 200)
    private String nomeArquivo;

    /**
     * Tamanho do arquivo em bytes
     */
    @Column(name = "tamanho_bytes")
    private Long tamanhoBytes;

    /**
     * Observações adicionais sobre o documento
     */
    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    /**
     * Data de criação do documento
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Indica se o documento ainda está ativo/disponível
     */
    @Column(name = "ativo", nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean ativo = true;

    // ========== MÉTODOS DE CONVENIÊNCIA ==========

    /**
     * Construtor de conveniência para criar documento com dados essenciais
     */
    public Documento(TipoDocumento tipo, Paciente paciente, String caminhoArquivo, 
                    String hash, String nomeArquivo) {
        this.tipo = tipo;
        this.paciente = paciente;
        this.caminhoArquivo = caminhoArquivo;
        this.hash = hash;
        this.nomeArquivo = nomeArquivo;
        this.ativo = true;
    }

    /**
     * Enum para os tipos de documentos suportados
     */
    public enum TipoDocumento {
        ATESTADO("Atestado Médico"),
        RECEITUARIO("Receituário"),
        COMPROVANTE("Comprovante de Atendimento");

        private final String descricao;

        TipoDocumento(String descricao) {
            this.descricao = descricao;
        }

        public String getDescricao() {
            return descricao;
        }
    }

    // ========== MÉTODOS AUXILIARES ==========

    /**
     * Retorna o ID do paciente para facilitar queries
     */
    public Long getPacienteId() {
        return paciente != null ? paciente.getId() : null;
    }

    /**
     * Verifica se o documento é válido (arquivo existe e está ativo)
     */
    public boolean isValido() {
        return ativo != null && ativo && 
               caminhoArquivo != null && !caminhoArquivo.trim().isEmpty() &&
               hash != null && !hash.trim().isEmpty();
    }

    @Override
    public String toString() {
        return String.format("Documento{id=%d, tipo=%s, pacienteId=%d, arquivo='%s', ativo=%s}", 
                           id, tipo, getPacienteId(), nomeArquivo, ativo);
    }
}