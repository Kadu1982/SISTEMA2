package com.sistemadesaude.backend.logs.repository;

import com.sistemadesaude.backend.logs.model.LogSistema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositório do Log do Sistema.
 */
@Repository
public interface LogSistemaRepository extends JpaRepository<LogSistema, String> {
}
