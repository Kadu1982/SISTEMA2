package com.sistemadesaude.backend.biometria.repository;

import com.sistemadesaude.backend.biometria.model.Biometria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositório de Biometrias.
 * Mantém a assinatura usada pelo service:
 *  - findByOperadorIdOrderByDataCapturaDesc(Long operadorId)
 */
@Repository
public interface BiometriaRepository extends JpaRepository<Biometria, Long> {
    List<Biometria> findByOperadorIdOrderByDataCapturaDesc(Long operadorId);
}
