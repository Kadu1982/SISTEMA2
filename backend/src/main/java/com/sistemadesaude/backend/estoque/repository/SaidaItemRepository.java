package com.sistemadesaude.backend.estoque.repository;

import com.sistemadesaude.backend.estoque.entity.SaidaItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SaidaItemRepository extends JpaRepository<SaidaItem, Long> { }
