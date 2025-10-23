package com.sistemadesaude.backend.estoque.repository;

import com.sistemadesaude.backend.estoque.entity.Saida;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SaidaRepository extends JpaRepository<Saida, Long> { }
