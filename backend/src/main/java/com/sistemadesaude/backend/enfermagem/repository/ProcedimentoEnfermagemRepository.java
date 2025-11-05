package com.sistemadesaude.backend.enfermagem.repository;

import com.sistemadesaude.backend.enfermagem.entity.ProcedimentoEnfermagem;
import com.sistemadesaude.backend.enfermagem.entity.ProcedimentoEnfermagem.StatusProcedimento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProcedimentoEnfermagemRepository extends JpaRepository<ProcedimentoEnfermagem, Long> {

    List<ProcedimentoEnfermagem> findByAtendimentoId(Long atendimentoId);

    List<ProcedimentoEnfermagem> findByAtendimentoIdAndStatus(Long atendimentoId, StatusProcedimento status);

    @Query("SELECT p FROM ProcedimentoEnfermagem p WHERE p.atendimento.id = :atendimentoId " +
           "ORDER BY p.criadoEm ASC")
    List<ProcedimentoEnfermagem> findProcedimentosPorAtendimento(@Param("atendimentoId") Long atendimentoId);
}
