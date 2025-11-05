package com.sistemadesaude.backend.logs.repository;

import com.sistemadesaude.backend.logs.model.LogSistema;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repositório simples para persistir registros em {@code logs_sistema}.
 */
public interface LogSistemaRepository extends JpaRepository<LogSistema, String> {
}
