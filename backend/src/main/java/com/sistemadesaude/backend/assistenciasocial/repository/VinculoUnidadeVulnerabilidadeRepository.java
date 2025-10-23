package com.sistemadesaude.backend.assistenciasocial.repository;

import com.sistemadesaude.backend.assistenciasocial.entity.ConfiguracaoAssistenciaSocial;
import com.sistemadesaude.backend.assistenciasocial.entity.TipoVulnerabilidade;
import com.sistemadesaude.backend.assistenciasocial.entity.UnidadeAssistencial;
import com.sistemadesaude.backend.assistenciasocial.entity.VinculoUnidadeVulnerabilidade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository para a entidade VinculoUnidadeVulnerabilidade.
 */
@Repository
public interface VinculoUnidadeVulnerabilidadeRepository extends JpaRepository<VinculoUnidadeVulnerabilidade, Long> {
    
    /**
     * Busca todos os vínculos por configuração.
     * @param configuracao A configuração.
     * @return Lista de vínculos.
     */
    List<VinculoUnidadeVulnerabilidade> findByConfiguracao(ConfiguracaoAssistenciaSocial configuracao);
    
    /**
     * Busca todos os vínculos por unidade.
     * @param unidade A unidade assistencial.
     * @return Lista de vínculos.
     */
    List<VinculoUnidadeVulnerabilidade> findByUnidade(UnidadeAssistencial unidade);
    
    /**
     * Busca todos os vínculos por tipo de vulnerabilidade.
     * @param tipoVulnerabilidade O tipo de vulnerabilidade.
     * @return Lista de vínculos.
     */
    List<VinculoUnidadeVulnerabilidade> findByTipoVulnerabilidade(TipoVulnerabilidade tipoVulnerabilidade);
    
    /**
     * Busca um vínculo específico por unidade e tipo de vulnerabilidade.
     * @param unidade A unidade assistencial.
     * @param tipoVulnerabilidade O tipo de vulnerabilidade.
     * @return O vínculo encontrado ou null.
     */
    VinculoUnidadeVulnerabilidade findByUnidadeAndTipoVulnerabilidade(UnidadeAssistencial unidade, TipoVulnerabilidade tipoVulnerabilidade);
    
    /**
     * Verifica se existe um vínculo para a unidade e tipo de vulnerabilidade.
     * @param unidade A unidade assistencial.
     * @param tipoVulnerabilidade O tipo de vulnerabilidade.
     * @return true se existe, false caso contrário.
     */
    boolean existsByUnidadeAndTipoVulnerabilidade(UnidadeAssistencial unidade, TipoVulnerabilidade tipoVulnerabilidade);
}
