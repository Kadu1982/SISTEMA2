package com.sistemadesaude.backend.samu.repository;

import com.sistemadesaude.backend.samu.entity.TipoLigacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TipoLigacaoRepository extends JpaRepository<TipoLigacao, Long> {

    /**
     * Lista apenas tipos ativos
     */
    List<TipoLigacao> findByAtivoTrue();

    /**
     * Busca tipos que encerram a ocorrência
     */
    List<TipoLigacao> findByEncerramentoTrueAndAtivoTrue();

    /**
     * Busca tipos que NÃO encerram a ocorrência
     */
    List<TipoLigacao> findByEncerramentoFalseAndAtivoTrue();
}
