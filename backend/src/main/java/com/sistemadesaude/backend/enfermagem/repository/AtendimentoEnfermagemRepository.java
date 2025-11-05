package com.sistemadesaude.backend.enfermagem.repository;

import com.sistemadesaude.backend.enfermagem.entity.AtendimentoEnfermagem;
import com.sistemadesaude.backend.enfermagem.entity.AtendimentoEnfermagem.StatusAtendimento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AtendimentoEnfermagemRepository extends JpaRepository<AtendimentoEnfermagem, Long> {

    Page<AtendimentoEnfermagem> findByUnidadeIdAndStatus(Long unidadeId, StatusAtendimento status, Pageable pageable);

    Page<AtendimentoEnfermagem> findByUnidadeId(Long unidadeId, Pageable pageable);

    Page<AtendimentoEnfermagem> findByPacienteId(Long pacienteId, Pageable pageable);

    List<AtendimentoEnfermagem> findByStatus(StatusAtendimento status);

    @Query("SELECT a FROM AtendimentoEnfermagem a WHERE a.unidade.id = :unidadeId " +
           "AND a.status IN :statuses ORDER BY a.prioridade DESC, a.dataHoraInicio ASC")
    List<AtendimentoEnfermagem> findFilaAtendimento(
        @Param("unidadeId") Long unidadeId,
        @Param("statuses") List<StatusAtendimento> statuses
    );

    @Query("SELECT a FROM AtendimentoEnfermagem a WHERE a.unidade.id = :unidadeId " +
           "AND a.dataHoraInicio BETWEEN :inicio AND :fim")
    List<AtendimentoEnfermagem> findByUnidadeAndPeriodo(
        @Param("unidadeId") Long unidadeId,
        @Param("inicio") LocalDateTime inicio,
        @Param("fim") LocalDateTime fim
    );

    @Query("SELECT COUNT(a) FROM AtendimentoEnfermagem a WHERE a.unidade.id = :unidadeId AND a.status = :status")
    Long countByUnidadeAndStatus(@Param("unidadeId") Long unidadeId, @Param("status") StatusAtendimento status);
}
