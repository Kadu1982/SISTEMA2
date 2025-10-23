package com.sistemadesaude.backend.saudefamilia.repository;

import com.sistemadesaude.backend.saudefamilia.entity.Area;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AreaRepository extends JpaRepository<Area, Long> {
    Optional<Area> findByIne(String ine);
    boolean existsByIne(String ine);
}
