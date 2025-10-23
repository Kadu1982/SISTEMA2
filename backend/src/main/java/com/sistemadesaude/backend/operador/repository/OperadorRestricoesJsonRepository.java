package com.sistemadesaude.backend.operador.repository;

import com.sistemadesaude.backend.operador.entity.OperadorRestricoesJson;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * CRUD do blob JSON de restrições por operador.
 */
public interface OperadorRestricoesJsonRepository extends JpaRepository<OperadorRestricoesJson, Long> { }
