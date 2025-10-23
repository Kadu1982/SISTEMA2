package com.sistemadesaude.backend.samu.repository;

import com.sistemadesaude.backend.samu.entity.Viatura;
import com.sistemadesaude.backend.samu.enums.StatusViatura;
import com.sistemadesaude.backend.samu.enums.TipoViatura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ViaturaRepository extends JpaRepository<Viatura, Long> {

    /**
     * Busca viatura por identificação
     */
    Optional<Viatura> findByIdentificacao(String identificacao);

    /**
     * Lista viaturas ativas
     */
    List<Viatura> findByAtivaTrue();

    /**
     * Lista viaturas por status
     */
    List<Viatura> findByStatusAndAtivaTrue(StatusViatura status);

    /**
     * Lista viaturas por tipo
     */
    List<Viatura> findByTipoAndAtivaTrue(TipoViatura tipo);

    /**
     * Lista viaturas disponíveis
     */
    @Query("SELECT v FROM Viatura v WHERE v.status = 'DISPONIVEL' AND v.ativa = true")
    List<Viatura> findDisponivels();

    /**
     * Lista viaturas disponíveis por tipo
     */
    @Query("SELECT v FROM Viatura v WHERE v.tipo = :tipo AND v.status = 'DISPONIVEL' AND v.ativa = true")
    List<Viatura> findDisponiveisPorTipo(TipoViatura tipo);

    /**
     * Lista viaturas de uma base
     */
    List<Viatura> findByBaseId(Long baseId);

    /**
     * Conta viaturas disponíveis
     */
    @Query("SELECT COUNT(v) FROM Viatura v WHERE v.status = 'DISPONIVEL' AND v.ativa = true")
    Long countDisponivels();

    /**
     * Conta viaturas em operação
     */
    @Query("SELECT COUNT(v) FROM Viatura v WHERE v.status IN ('A_CAMINHO', 'NO_LOCAL', 'TRANSPORTANDO') AND v.ativa = true")
    Long countEmOperacao();
}
