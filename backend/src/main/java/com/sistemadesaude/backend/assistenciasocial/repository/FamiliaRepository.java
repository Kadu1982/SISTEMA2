package com.sistemadesaude.backend.assistenciasocial.repository;

import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.assistenciasocial.entity.Familia;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

/**
 * Repository para a entidade Familia.
 */
@Repository
public interface FamiliaRepository extends JpaRepository<Familia, Long> {

    /**
     * Busca uma família pelo código familiar.
     * @param codigoFamiliar O código familiar.
     * @return A família encontrada.
     */
    Optional<Familia> findByCodigoFamiliar(String codigoFamiliar);

    /**
     * Busca uma família pelo responsável.
     * @param responsavel O responsável pela família.
     * @return A família encontrada.
     */
    Optional<Familia> findByResponsavel(Paciente responsavel);

    /**
     * Busca famílias pelo bairro.
     * @param bairro O bairro.
     * @param pageable Paginação.
     * @return As famílias encontradas.
     */
    Page<Familia> findByBairro(String bairro, Pageable pageable);

    /**
     * Busca famílias por faixa de renda per capita.
     * @param rendaPerCapitaMin A renda per capita mínima.
     * @param rendaPerCapitaMax A renda per capita máxima.
     * @param pageable Paginação.
     * @return As famílias encontradas.
     */
    @Query("SELECT f FROM Familia f JOIN f.rendas r GROUP BY f HAVING SUM(r.valor) / COUNT(f.membros) BETWEEN :rendaPerCapitaMin AND :rendaPerCapitaMax")
    Page<Familia> findByRendaPerCapitaBetween(@Param("rendaPerCapitaMin") BigDecimal rendaPerCapitaMin, 
                                             @Param("rendaPerCapitaMax") BigDecimal rendaPerCapitaMax,
                                             Pageable pageable);

    /**
     * Busca famílias por nome do responsável.
     * @param nome O nome do responsável.
     * @param pageable Paginação.
     * @return As famílias encontradas.
     */
    @Query("SELECT f FROM Familia f WHERE LOWER(f.responsavel.nomeCompleto) LIKE LOWER(CONCAT('%', :nome, '%'))")
    Page<Familia> findByResponsavelNomeContainingIgnoreCase(@Param("nome") String nome, Pageable pageable);

    /**
     * Busca famílias por tipo de família.
     * @param tipoFamilia O tipo de família.
     * @param pageable Paginação.
     * @return As famílias encontradas.
     */
    Page<Familia> findByTipoFamilia(Familia.TipoFamilia tipoFamilia, Pageable pageable);
}
