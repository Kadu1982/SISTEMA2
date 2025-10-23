package com.sistemadesaude.backend.assistenciasocial.repository;

import com.sistemadesaude.backend.operador.entity.Operador;
import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.assistenciasocial.entity.Encaminhamento;
import com.sistemadesaude.backend.assistenciasocial.entity.Familia;
import com.sistemadesaude.backend.assistenciasocial.entity.OrgaoRedeAssistencial;
import com.sistemadesaude.backend.assistenciasocial.entity.TipoEncaminhamento;
import com.sistemadesaude.backend.assistenciasocial.entity.UnidadeAssistencial;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

/**
 * Repository para a entidade Encaminhamento.
 */
@Repository
public interface EncaminhamentoRepository extends JpaRepository<Encaminhamento, Long> {
    
    /**
     * Busca encaminhamentos por unidade assistencial.
     * @param unidade A unidade assistencial.
     * @param pageable Paginação.
     * @return Os encaminhamentos encontrados.
     */
    Page<Encaminhamento> findByUnidade(UnidadeAssistencial unidade, Pageable pageable);
    
    /**
     * Busca encaminhamentos por paciente.
     * @param paciente O paciente.
     * @param pageable Paginação.
     * @return Os encaminhamentos encontrados.
     */
    Page<Encaminhamento> findByPaciente(Paciente paciente, Pageable pageable);
    
    /**
     * Busca encaminhamentos por família.
     * @param familia A família.
     * @param pageable Paginação.
     * @return Os encaminhamentos encontrados.
     */
    Page<Encaminhamento> findByFamilia(Familia familia, Pageable pageable);
    
    /**
     * Busca encaminhamentos por profissional.
     * @param profissional O profissional.
     * @param pageable Paginação.
     * @return Os encaminhamentos encontrados.
     */
    Page<Encaminhamento> findByProfissional(Operador profissional, Pageable pageable);
    
    /**
     * Busca encaminhamentos por tipo de encaminhamento.
     * @param tipoEncaminhamento O tipo de encaminhamento.
     * @param pageable Paginação.
     * @return Os encaminhamentos encontrados.
     */
    Page<Encaminhamento> findByTipoEncaminhamento(TipoEncaminhamento tipoEncaminhamento, Pageable pageable);
    
    /**
     * Busca encaminhamentos por destino.
     * @param destino O destino do encaminhamento.
     * @param pageable Paginação.
     * @return Os encaminhamentos encontrados.
     */
    Page<Encaminhamento> findByDestino(OrgaoRedeAssistencial destino, Pageable pageable);
    
    /**
     * Busca encaminhamentos por período.
     * @param dataInicio A data de início do período.
     * @param dataFim A data de fim do período.
     * @param pageable Paginação.
     * @return Os encaminhamentos encontrados.
     */
    Page<Encaminhamento> findByDataEncaminhamentoBetween(LocalDate dataInicio, LocalDate dataFim, Pageable pageable);
    
    /**
     * Busca encaminhamentos pendentes de contra-referência.
     * @param pageable Paginação.
     * @return Os encaminhamentos encontrados.
     */
    Page<Encaminhamento> findByDataContrareferenciaNullAndDataEncaminhamentoLessThanEqual(LocalDate dataLimite, Pageable pageable);
    
    /**
     * Conta o número de encaminhamentos por unidade assistencial e período.
     * @param unidade A unidade assistencial.
     * @param dataInicio A data de início do período.
     * @param dataFim A data de fim do período.
     * @return O número de encaminhamentos.
     */
    long countByUnidadeAndDataEncaminhamentoBetween(UnidadeAssistencial unidade, LocalDate dataInicio, LocalDate dataFim);
    
    /**
     * Conta o número de encaminhamentos por tipo de encaminhamento e período.
     * @param tipoEncaminhamento O tipo de encaminhamento.
     * @param dataInicio A data de início do período.
     * @param dataFim A data de fim do período.
     * @return O número de encaminhamentos.
     */
    long countByTipoEncaminhamentoAndDataEncaminhamentoBetween(TipoEncaminhamento tipoEncaminhamento, LocalDate dataInicio, LocalDate dataFim);
}
