package com.sistemadesaude.backend.estoque.repository;

import com.sistemadesaude.backend.estoque.entity.LocalArmazenamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LocalArmazenamentoRepository extends JpaRepository<LocalArmazenamento, Long> {
    boolean existsByNomeAndUnidadeSaude_Id(String nome, Long unidadeSaudeId);
}
