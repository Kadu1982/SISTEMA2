package com.sistemadesaude.backend.samu.repository;

import com.sistemadesaude.backend.samu.entity.BaseOperacional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BaseOperacionalRepository extends JpaRepository<BaseOperacional, Long> {

    /**
     * Busca base por código
     */
    Optional<BaseOperacional> findByCodigo(String codigo);

    /**
     * Lista bases ativas
     */
    List<BaseOperacional> findByAtivaTrue();

    /**
     * Busca por nome
     */
    List<BaseOperacional> findByNomeContainingIgnoreCase(String nome);

    /**
     * Verifica se existe base com o código
     */
    boolean existsByCodigo(String codigo);
}
