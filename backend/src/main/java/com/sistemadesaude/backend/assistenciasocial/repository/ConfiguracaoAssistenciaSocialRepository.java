package com.sistemadesaude.backend.assistenciasocial.repository;

import com.sistemadesaude.backend.assistenciasocial.entity.ConfiguracaoAssistenciaSocial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository para a entidade ConfiguracaoAssistenciaSocial.
 */
@Repository
public interface ConfiguracaoAssistenciaSocialRepository extends JpaRepository<ConfiguracaoAssistenciaSocial, Long> {
    
    /**
     * Busca a configuração mais recente.
     * @return A configuração mais recente.
     */
    ConfiguracaoAssistenciaSocial findTopByOrderByDataAtualizacaoDesc();
}
