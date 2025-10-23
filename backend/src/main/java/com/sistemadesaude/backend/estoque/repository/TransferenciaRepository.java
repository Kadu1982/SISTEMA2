package com.sistemadesaude.backend.estoque.repository;

import com.sistemadesaude.backend.estoque.entity.Transferencia;
import com.sistemadesaude.backend.estoque.enums.StatusTransferencia;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransferenciaRepository extends JpaRepository<Transferencia, Long> {
    List<Transferencia> findByLocalDestinoIdAndStatus(Long localDestinoId, StatusTransferencia status);
}
