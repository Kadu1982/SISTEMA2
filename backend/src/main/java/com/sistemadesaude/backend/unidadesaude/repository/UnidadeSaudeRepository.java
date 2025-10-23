package com.sistemadesaude.backend.unidadesaude.repository;

import com.sistemadesaude.backend.unidadesaude.entity.TipoUnidadeSaude;
import com.sistemadesaude.backend.unidadesaude.entity.UnidadeSaude;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositório para operações de dados da entidade UnidadeSaude
 */
@Repository
public interface UnidadeSaudeRepository extends JpaRepository<UnidadeSaude, Long> {

    /**
     * Busca unidade por código CNES
     */
    Optional<UnidadeSaude> findByCodigoCnes(String codigoCnes);

    /**
     * Verifica se existe unidade com código CNES
     */
    boolean existsByCodigoCnes(String codigoCnes);

    /**
     * Busca unidades ativas
     */
    List<UnidadeSaude> findByAtivaTrueOrderByNome();

    /**
     * Busca unidades por tipo
     */
    List<UnidadeSaude> findByTipoAndAtivaTrueOrderByNome(TipoUnidadeSaude tipo);

    /**
     * Busca unidades por cidade
     */
    List<UnidadeSaude> findByCidadeIgnoreCaseAndAtivaTrueOrderByNome(String cidade);

    /**
     * Busca unidades por estado
     */
    List<UnidadeSaude> findByEstadoIgnoreCaseAndAtivaTrueOrderByNome(String estado);

    /**
     * Busca unidades por nome contendo texto
     */
    List<UnidadeSaude> findByNomeContainingIgnoreCaseAndAtivaTrueOrderByNome(String nome);

    /**
     * Busca unidades de urgência/emergência
     */
    @Query("SELECT u FROM UnidadeSaude u WHERE u.tipo IN :tipos AND u.ativa = true ORDER BY u.nome")
    List<UnidadeSaude> findUnidadesUrgencia(@Param("tipos") List<TipoUnidadeSaude> tipos);

    /**
     * Busca unidades de atenção primária
     */
    @Query("SELECT u FROM UnidadeSaude u WHERE u.tipo IN ('UBS', 'CLINICA') AND u.ativa = true ORDER BY u.nome")
    List<UnidadeSaude> findUnidadesAtencaoPrimaria();

    /**
     * Conta unidades por tipo
     */
    long countByTipoAndAtivaTrue(TipoUnidadeSaude tipo);

    /**
     * Conta unidades ativas
     */
    long countByAtivaTrue();
}
