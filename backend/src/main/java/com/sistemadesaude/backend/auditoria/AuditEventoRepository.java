package com.sistemadesaude.backend.auditoria;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repositório de leitura/gravação de eventos de auditoria.
 *
 * Uso típico:
 *  - Salvar: auditEventoRepository.save(evento);
 *  - Listar por período/entidade para relatórios administrativos.
 */
public interface AuditEventoRepository extends JpaRepository<AuditEvento, Long> {

    /** Consulta simples por intervalo de datas (útil para relatórios) */
    @Query("""
           SELECT a
             FROM AuditEvento a
            WHERE a.dataHora BETWEEN :de AND :ate
            ORDER BY a.dataHora DESC
           """)
    List<AuditEvento> listarPorPeriodo(LocalDateTime de, LocalDateTime ate);

    /** Consulta por entidade específica (pode combinar com período na sua service) */
    List<AuditEvento> findByEntidadeOrderByDataHoraDesc(String entidade);
}
