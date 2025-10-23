package com.sistemadesaude.backend.saudefamilia.repository;

import com.sistemadesaude.backend.saudefamilia.entity.CondicaoSaudeVisita;
import com.sistemadesaude.backend.saudefamilia.entity.VisitaDomiciliar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CondicaoSaudeVisitaRepository extends JpaRepository<CondicaoSaudeVisita, Long> {
    List<CondicaoSaudeVisita> findByVisita(VisitaDomiciliar visita);
}
