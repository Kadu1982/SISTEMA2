package com.sistemadesaude.backend.samu.repository;

import com.sistemadesaude.backend.samu.entity.TipoSolicitante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TipoSolicitanteRepository extends JpaRepository<TipoSolicitante, Long> {

    /**
     * Lista apenas tipos ativos
     */
    List<TipoSolicitante> findByAtivoTrue();

    /**
     * Busca por nome
     */
    List<TipoSolicitante> findByNomeContainingIgnoreCase(String nome);
}
