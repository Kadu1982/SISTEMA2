package com.sistemadesaude.backend.audit.repository;

import com.sistemadesaude.backend.audit.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findByUsuarioId(Long usuarioId, Pageable pageable);

    Page<AuditLog> findByTipoOperacao(AuditLog.TipoOperacao tipoOperacao, Pageable pageable);

    Page<AuditLog> findByDataHoraBetween(LocalDateTime inicio, LocalDateTime fim, Pageable pageable);

    @Query("SELECT a FROM AuditLog a WHERE a.usuarioId = :usuarioId " +
           "AND a.tipoOperacao = :tipoOperacao " +
           "AND a.dataHora >= :dataInicio")
    List<AuditLog> findTentativasRecentes(
        @Param("usuarioId") Long usuarioId,
        @Param("tipoOperacao") AuditLog.TipoOperacao tipoOperacao,
        @Param("dataInicio") LocalDateTime dataInicio
    );

    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.usuarioId = :usuarioId " +
           "AND a.tipoOperacao = 'FALHA_AUTENTICACAO' " +
           "AND a.dataHora >= :dataInicio")
    Long countFalhasAutenticacao(
        @Param("usuarioId") Long usuarioId,
        @Param("dataInicio") LocalDateTime dataInicio
    );
}
