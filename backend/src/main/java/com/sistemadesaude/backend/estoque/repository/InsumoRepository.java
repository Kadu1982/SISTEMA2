package com.sistemadesaude.backend.estoque.repository;

import com.sistemadesaude.backend.estoque.entity.Insumo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InsumoRepository extends JpaRepository<Insumo, Long> {

    // Opcional: buscas frequentes
    List<Insumo> findByAtivoTrue();

    List<Insumo> findByDescricaoContainingIgnoreCaseOrderByDescricaoAsc(String descricao);
}
