package com.sistemadesaude.backend.estoque.repository;

import com.sistemadesaude.backend.estoque.entity.EntradaItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EntradaItemRepository extends JpaRepository<EntradaItem, Long> { }
