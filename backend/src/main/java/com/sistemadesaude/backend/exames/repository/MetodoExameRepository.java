package com.sistemadesaude.backend.exames.repository;

import com.sistemadesaude.backend.exames.entity.MetodoExame;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MetodoExameRepository extends JpaRepository<MetodoExame, Long> {

    List<MetodoExame> findByExameIdAndAtivoTrue(Long exameId);

    @Query("SELECT m FROM MetodoExame m WHERE m.exame.id = :exameId AND m.ativo = true AND " +
           "(m.sexo = :sexo OR m.sexo = 'AMBOS') AND " +
           "(:idadeMeses >= m.idadeMinimaMeses OR m.idadeMinimaMeses IS NULL) AND " +
           "(:idadeMeses <= m.idadeMaximaMeses OR m.idadeMaximaMeses IS NULL)")
    Optional<MetodoExame> findMetodoAplicavel(
        @Param("exameId") Long exameId,
        @Param("sexo") MetodoExame.SexoReferencia sexo,
        @Param("idadeMeses") Integer idadeMeses
    );
}