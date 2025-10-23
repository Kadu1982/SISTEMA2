package com.sistemadesaude.backend.exames.repository;

import com.sistemadesaude.backend.exames.entity.TextoPronto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TextoProntoRepository extends JpaRepository<TextoPronto, Long> {

    List<TextoPronto> findByExameIdAndAtivoTrue(Long exameId);

    List<TextoPronto> findByAtivoTrue();

    Optional<TextoPronto> findByAbreviatura(String abreviatura);
}