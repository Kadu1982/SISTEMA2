package com.sistemadesaude.backend.estoque.repository;

import com.sistemadesaude.backend.estoque.entity.Fornecedor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FornecedorRepository extends JpaRepository<Fornecedor, Long> { }
