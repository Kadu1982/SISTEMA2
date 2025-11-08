package com.sistemadesaude.backend.procedimentosrapidos.repository;

import com.sistemadesaude.backend.procedimentosrapidos.entity.AssinaturaDigital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository para AssinaturaDigital
 */
@Repository
public interface AssinaturaDigitalRepository extends JpaRepository<AssinaturaDigital, Long> {

    /**
     * Busca assinatura digital por operador
     * @param operadorId ID do operador
     * @return Optional com a assinatura digital
     */
    Optional<AssinaturaDigital> findByOperadorId(Long operadorId);

    /**
     * Busca assinatura digital por atividade de enfermagem
     * @param atividadeEnfermagemId ID da atividade
     * @return Optional com a assinatura digital
     */
    Optional<AssinaturaDigital> findByAtividadeEnfermagemId(Long atividadeEnfermagemId);

    /**
     * Verifica se operador tem senha de assinatura cadastrada
     * @param operadorId ID do operador
     * @return true se existe, false caso contrário
     */
    boolean existsByOperadorId(Long operadorId);
}