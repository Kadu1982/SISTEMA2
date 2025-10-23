package com.sistemadesaude.backend.exames.repository;

import com.sistemadesaude.backend.exames.entity.ColetaMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ColetaMaterialRepository extends JpaRepository<ColetaMaterial, Long> {

    List<ColetaMaterial> findByRecepcaoId(Long recepcaoId);

    Optional<ColetaMaterial> findByRecepcaoIdAndDataColeta(Long recepcaoId, LocalDateTime dataColeta);

    @Query("SELECT c FROM ColetaMaterial c WHERE c.dataColeta BETWEEN :dataInicio AND :dataFim")
    List<ColetaMaterial> findByPeriodo(
        @Param("dataInicio") LocalDateTime dataInicio,
        @Param("dataFim") LocalDateTime dataFim
    );
}