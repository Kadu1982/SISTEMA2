package com.sistemadesaude.backend.assistenciasocial.repository;

import com.sistemadesaude.backend.assistenciasocial.entity.Beneficio;
import com.sistemadesaude.backend.assistenciasocial.entity.TipoBeneficio;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository para a entidade Beneficio.
 */
@Repository
public interface BeneficioRepository extends JpaRepository<Beneficio, Long> {
    
    /**
     * Busca um benefício pelo nome.
     * @param nome O nome do benefício.
     * @return O benefício encontrado.
     */
    Optional<Beneficio> findByNome(String nome);
    
    /**
     * Busca benefícios pelo nome contendo o texto informado, ignorando case.
     * @param nome O texto a ser buscado no nome do benefício.
     * @param pageable Paginação.
     * @return Os benefícios encontrados.
     */
    Page<Beneficio> findByNomeContainingIgnoreCase(String nome, Pageable pageable);
    
    /**
     * Busca benefícios ativos.
     * @return Os benefícios ativos.
     */
    List<Beneficio> findByAtivoTrue();
    
    /**
     * Busca benefícios ativos, paginado.
     * @param pageable Paginação.
     * @return Os benefícios ativos.
     */
    Page<Beneficio> findByAtivoTrue(Pageable pageable);
    
    /**
     * Busca benefícios por tipo de benefício.
     * @param tipoBeneficio O tipo de benefício.
     * @return Os benefícios encontrados.
     */
    List<Beneficio> findByTipoBeneficio(TipoBeneficio tipoBeneficio);
    
    /**
     * Busca benefícios por tipo de benefício, paginado.
     * @param tipoBeneficio O tipo de benefício.
     * @param pageable Paginação.
     * @return Os benefícios encontrados.
     */
    Page<Beneficio> findByTipoBeneficio(TipoBeneficio tipoBeneficio, Pageable pageable);
    
    /**
     * Busca benefícios ativos por tipo de benefício.
     * @param tipoBeneficio O tipo de benefício.
     * @return Os benefícios ativos encontrados.
     */
    List<Beneficio> findByTipoBeneficioAndAtivoTrue(TipoBeneficio tipoBeneficio);
}
