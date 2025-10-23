package com.sistemadesaude.backend.estoque.repository;

import com.sistemadesaude.backend.estoque.entity.TransferenciaItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransferenciaItemRepository extends JpaRepository<TransferenciaItem, Long> { }
