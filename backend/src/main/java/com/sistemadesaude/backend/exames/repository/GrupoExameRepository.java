package com.sistemadesaude.backend.exames.repository;

import com.sistemadesaude.backend.exames.entity.GrupoExame;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GrupoExameRepository extends JpaRepository<GrupoExame, Long> {

    Optional<GrupoExame> findByCodigo(String codigo);

    List<GrupoExame> findByAtivoTrueOrderByOrdemAsc();

    List<GrupoExame> findByAtivoTrue();
}