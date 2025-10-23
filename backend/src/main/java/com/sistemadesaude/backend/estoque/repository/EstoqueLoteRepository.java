package com.sistemadesaude.backend.estoque.repository;

import com.sistemadesaude.backend.estoque.entity.EstoqueLote;
import com.sistemadesaude.backend.estoque.entity.Lote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EstoqueLoteRepository extends JpaRepository<EstoqueLote, Long> {
    Optional<EstoqueLote> findByLocalIdAndLoteId(Long localId, Long loteId);
    List<EstoqueLote> findByLocalIdAndLoteIn(Long localId, List<Lote> lotes);
}
