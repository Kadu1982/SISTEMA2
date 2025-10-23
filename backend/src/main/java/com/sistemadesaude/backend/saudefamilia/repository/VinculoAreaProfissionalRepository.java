package com.sistemadesaude.backend.saudefamilia.repository;

import com.sistemadesaude.backend.saudefamilia.entity.VinculoAreaProfissional;
import com.sistemadesaude.backend.saudefamilia.entity.Area;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VinculoAreaProfissionalRepository extends JpaRepository<VinculoAreaProfissional, Long> {
    List<VinculoAreaProfissional> findByArea(Area area);
}
