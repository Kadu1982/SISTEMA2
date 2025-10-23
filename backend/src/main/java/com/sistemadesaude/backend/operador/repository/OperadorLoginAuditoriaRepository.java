package com.sistemadesaude.backend.operador.repository;

import com.sistemadesaude.backend.operador.entity.OperadorLoginAuditoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OperadorLoginAuditoriaRepository extends JpaRepository<OperadorLoginAuditoria, Long> {
    List<OperadorLoginAuditoria> findByOperadorIdOrderByDataHoraDesc(Long operadorId);
}
