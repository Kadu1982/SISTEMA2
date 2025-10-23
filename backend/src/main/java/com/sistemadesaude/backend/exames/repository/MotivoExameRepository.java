package com.sistemadesaude.backend.exames.repository;

import com.sistemadesaude.backend.exames.entity.MotivoExame;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MotivoExameRepository extends JpaRepository<MotivoExame, Long> {

    Optional<MotivoExame> findByCodigo(String codigo);

    List<MotivoExame> findByAtivoTrue();
}