package com.sistemadesaude.backend.saudefamilia.repository;

import com.sistemadesaude.backend.saudefamilia.entity.Microarea;
import com.sistemadesaude.backend.saudefamilia.entity.Area;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MicroareaRepository extends JpaRepository<Microarea, Long> {
    List<Microarea> findByArea(Area area);
    boolean existsByAreaAndCodigo(Area area, Integer codigo);
}
