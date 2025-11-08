package com.sistemadesaude.backend.procedimentosrapidos.repository;

import com.sistemadesaude.backend.procedimentosrapidos.entity.AtividadeEnfermagem;
import com.sistemadesaude.backend.procedimentosrapidos.enums.SituacaoAtividade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository para AtividadeEnfermagem
 */
@Repository
public interface AtividadeEnfermagemRepository extends JpaRepository<AtividadeEnfermagem, Long> {

    /**
     * Busca atividades por procedimento rápido
     */
    List<AtividadeEnfermagem> findByProcedimentoRapidoId(Long procedimentoRapidoId);

    /**
     * Busca atividades por situação
     */
    List<AtividadeEnfermagem> findBySituacao(SituacaoAtividade situacao);

    /**
     * Busca atividades por COREN
     */
    List<AtividadeEnfermagem> findByCorenRealizacao(String corenRealizacao);

    /**
     * Busca atividades com reação adversa
     */
    List<AtividadeEnfermagem> findByReacaoAdversaTrue();

    /**
     * Busca atividades atrasadas
     */
    @Query("SELECT a FROM AtividadeEnfermagem a " +
           "WHERE a.situacao = 'PENDENTE' " +
           "AND EXISTS (SELECT h FROM a.horariosAprazados h WHERE h < :dataHora)")
    List<AtividadeEnfermagem> findAtrasadas(@Param("dataHora") LocalDateTime dataHora);

    /**
     * Busca atividades assinadas digitalmente
     */
    List<AtividadeEnfermagem> findByHashAssinaturaDigitalIsNotNull();
}