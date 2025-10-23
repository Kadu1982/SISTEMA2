package com.sistemadesaude.backend.samu.repository;

import com.sistemadesaude.backend.samu.entity.OrigemSolicitacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrigemSolicitacaoRepository extends JpaRepository<OrigemSolicitacao, Long> {

    /**
     * Lista apenas origens ativas
     */
    List<OrigemSolicitacao> findByAtivoTrue();

    /**
     * Busca por nome
     */
    List<OrigemSolicitacao> findByNomeContainingIgnoreCase(String nome);
}
