package com.sistemadesaude.backend.estoque.repository;

import com.sistemadesaude.backend.estoque.entity.Lote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface LoteRepository extends JpaRepository<Lote, Long> {
    Optional<Lote> findByInsumoIdAndFabricanteIdAndLoteFabricante(Long insumoId, Long fabricanteId, String loteFabricante);
    List<Lote> findByInsumoId(Long insumoId);
}
