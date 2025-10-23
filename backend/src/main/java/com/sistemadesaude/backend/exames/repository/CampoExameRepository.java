package com.sistemadesaude.backend.exames.repository;

import com.sistemadesaude.backend.exames.entity.CampoExame;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CampoExameRepository extends JpaRepository<CampoExame, Long> {

    List<CampoExame> findByExameIdAndAtivoTrueOrderByOrdemAsc(Long exameId);

    List<CampoExame> findByExameIdOrderByOrdemAsc(Long exameId);
}