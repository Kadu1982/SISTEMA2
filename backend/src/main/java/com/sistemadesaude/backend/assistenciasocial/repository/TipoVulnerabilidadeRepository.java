package com.sistemadesaude.backend.assistenciasocial.repository;

import com.sistemadesaude.backend.assistenciasocial.entity.TipoVulnerabilidade;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository para a entidade TipoVulnerabilidade.
 */
@Repository
public interface TipoVulnerabilidadeRepository extends JpaRepository<TipoVulnerabilidade, Long> {
    
    /**
     * Busca um tipo de vulnerabilidade pelo nome.
     * @param nome O nome do tipo de vulnerabilidade.
     * @return O tipo de vulnerabilidade encontrado.
     */
    Optional<TipoVulnerabilidade> findByNome(String nome);
    
    /**
     * Busca tipos de vulnerabilidade pelo nome contendo o texto informado, ignorando case.
     * @param nome O texto a ser buscado no nome do tipo de vulnerabilidade.
     * @param pageable Paginação.
     * @return Os tipos de vulnerabilidade encontrados.
     */
    Page<TipoVulnerabilidade> findByNomeContainingIgnoreCase(String nome, Pageable pageable);
    
    /**
     * Busca tipos de vulnerabilidade ativos.
     * @return Os tipos de vulnerabilidade ativos.
     */
    List<TipoVulnerabilidade> findByAtivoTrue();
    
    /**
     * Busca tipos de vulnerabilidade ativos, paginado.
     * @param pageable Paginação.
     * @return Os tipos de vulnerabilidade ativos.
     */
    Page<TipoVulnerabilidade> findByAtivoTrue(Pageable pageable);
}
