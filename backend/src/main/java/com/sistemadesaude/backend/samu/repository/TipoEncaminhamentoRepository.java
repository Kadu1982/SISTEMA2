package com.sistemadesaude.backend.samu.repository;

import com.sistemadesaude.backend.samu.entity.TipoEncaminhamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TipoEncaminhamentoRepository extends JpaRepository<TipoEncaminhamento, Long> {

    /**
     * Lista apenas tipos ativos
     */
    List<TipoEncaminhamento> findByAtivoTrue();

    /**
     * Busca tipos que encerram a ocorrência
     */
    List<TipoEncaminhamento> findByEncerramentoTrueAndAtivoTrue();

    /**
     * Busca tipos que NÃO encerram a ocorrência
     */
    List<TipoEncaminhamento> findByEncerramentoFalseAndAtivoTrue();
}
