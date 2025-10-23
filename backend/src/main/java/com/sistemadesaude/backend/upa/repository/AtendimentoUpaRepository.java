package com.sistemadesaude.backend.upa.repository;

import com.sistemadesaude.backend.upa.entity.AtendimentoUpa;
import org.springframework.data.jpa.repository.JpaRepository;

/** Repositório de Atendimento UPA. */
public interface AtendimentoUpaRepository extends JpaRepository<AtendimentoUpa, Long> {}
