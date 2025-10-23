package com.sistemadesaude.backend.saudefamilia.repository;

import com.sistemadesaude.backend.saudefamilia.entity.TrackPoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TrackPointRepository extends JpaRepository<TrackPoint, Long> {
    List<TrackPoint> findByProfissionalIdAndDataHoraBetween(Long profissionalId, LocalDateTime inicio, LocalDateTime fim);
}
