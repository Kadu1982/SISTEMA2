package com.sistemadesaude.backend.exames.repository;

import com.sistemadesaude.backend.exames.entity.EntregaExame;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EntregaExameRepository extends JpaRepository<EntregaExame, Long> {

    Optional<EntregaExame> findByRecepcaoId(Long recepcaoId);

    @Query("SELECT e FROM EntregaExame e WHERE e.dataEntrega BETWEEN :dataInicio AND :dataFim")
    List<EntregaExame> findByPeriodo(
        @Param("dataInicio") LocalDateTime dataInicio,
        @Param("dataFim") LocalDateTime dataFim
    );

    List<EntregaExame> findByNomeRetirou(String nomeRetirou);

    List<EntregaExame> findByDocumentoRetirou(String documentoRetirou);
}