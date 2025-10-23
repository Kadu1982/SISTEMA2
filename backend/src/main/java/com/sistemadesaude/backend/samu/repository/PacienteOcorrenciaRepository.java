package com.sistemadesaude.backend.samu.repository;

import com.sistemadesaude.backend.samu.entity.PacienteOcorrencia;
import com.sistemadesaude.backend.samu.enums.RiscoPresumido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PacienteOcorrenciaRepository extends JpaRepository<PacienteOcorrencia, Long> {

    List<PacienteOcorrencia> findByOcorrenciaId(Long ocorrenciaId);

    List<PacienteOcorrencia> findByRiscoPresumido(RiscoPresumido risco);

    @Query("SELECT p FROM PacienteOcorrencia p WHERE p.ocorrencia.id = :ocorrenciaId AND p.riscoPresumido IS NULL")
    List<PacienteOcorrencia> findPacientesNaoReguladosByOcorrencia(@Param("ocorrenciaId") Long ocorrenciaId);

    @Query("SELECT COUNT(p) FROM PacienteOcorrencia p WHERE p.riscoPresumido = :risco AND p.ocorrencia.dataAbertura BETWEEN :inicio AND :fim")
    Long countByRiscoPresumidoAndPeriodo(@Param("risco") RiscoPresumido risco,
                                         @Param("inicio") LocalDateTime inicio,
                                         @Param("fim") LocalDateTime fim);

    @Query("SELECT p FROM PacienteOcorrencia p WHERE p.riscoPresumido IN :riscos ORDER BY p.ocorrencia.dataAbertura ASC")
    List<PacienteOcorrencia> findByRiscoPresumidoInOrderByDataAbertura(@Param("riscos") List<RiscoPresumido> riscos);
}
