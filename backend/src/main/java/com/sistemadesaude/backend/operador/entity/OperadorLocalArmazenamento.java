package com.sistemadesaude.backend.operador.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entidade de vínculo Operador ↔ Local de Armazenamento.
 *
 * Observações importantes:
 * - Usa @EmbeddedId com mapeamento explícito das colunas operador_id e local_id.
 * - Para reduzir dependências, deixei os relacionamentos @ManyToOne COMENTADOS
 *   (não são necessários para os endpoints atuais). Se quiser ativar depois:
 *      - Descomente as associações e ajuste os packages das entidades alvo.
 * - Sem cascata: este vínculo não deve criar/alterar Operador ou Local.
 */
@Entity
@Table(name = "operador_locais_armazenamento")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class OperadorLocalArmazenamento {

    @EmbeddedId
    @AttributeOverrides({
            @AttributeOverride(name = "operadorId", column = @Column(name = "operador_id")),
            @AttributeOverride(name = "localId",    column = @Column(name = "local_id"))
    })
    private OperadorLocalArmazenamentoId id;

    /* ============================================================
       Relacionamentos opcionais (descomente se/quando quiser usar)
       ============================================================ */

    // @ManyToOne(fetch = FetchType.LAZY, optional = false)
    // @MapsId("operadorId")
    // @JoinColumn(name = "operador_id", insertable = false, updatable = false)
    // private Operador operador;

    // @ManyToOne(fetch = FetchType.LAZY, optional = false)
    // @MapsId("localId")
    // @JoinColumn(name = "local_id", insertable = false, updatable = false)
    // private com.sistemadesaude.backend.estoque.entity.LocalArmazenamento local;

    /* ====================
       Fábricas utilitárias
       ==================== */

    /**
     * Fábrica simples para criar a entidade apenas com os IDs,
     * útil nos endpoints que montam os vínculos “em lote”.
     */
    public static OperadorLocalArmazenamento of(Long operadorId, Long localId) {
        return OperadorLocalArmazenamento.builder()
                .id(new OperadorLocalArmazenamentoId(operadorId, localId))
                .build();
    }
}
