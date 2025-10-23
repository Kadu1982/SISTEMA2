package com.sistemadesaude.backend.exames.repository;

import com.sistemadesaude.backend.exames.entity.MaterialExame;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaterialExameRepository extends JpaRepository<MaterialExame, Long> {

    Optional<MaterialExame> findByCodigo(String codigo);

    List<MaterialExame> findByAtivoTrue();

    Optional<MaterialExame> findBySigla(String sigla);
}