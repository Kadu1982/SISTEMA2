package com.sistemadesaude.backend.saudefamilia.repository;

import com.sistemadesaude.backend.saudefamilia.entity.VisitaDomiciliar;
import com.sistemadesaude.backend.saudefamilia.entity.Area;
import com.sistemadesaude.backend.saudefamilia.entity.Microarea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VisitaDomiciliarRepository extends JpaRepository<VisitaDomiciliar, Long> {
    List<VisitaDomiciliar> findByAreaAndDataHoraBetween(Area area, LocalDateTime inicio, LocalDateTime fim);
    List<VisitaDomiciliar> findByMicroareaAndDataHoraBetween(Microarea microarea, LocalDateTime inicio, LocalDateTime fim);
    long countByArea(Area area);
}
