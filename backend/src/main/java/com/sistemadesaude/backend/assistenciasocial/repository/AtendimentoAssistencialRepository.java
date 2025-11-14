package com.sistemadesaude.backend.assistenciasocial.repository;

import com.sistemadesaude.backend.operador.entity.Operador;
import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.assistenciasocial.entity.AtendimentoAssistencial;
import com.sistemadesaude.backend.assistenciasocial.entity.Familia;
import com.sistemadesaude.backend.assistenciasocial.entity.ServicoSocioassistencial;
import com.sistemadesaude.backend.assistenciasocial.entity.UnidadeAssistencial;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository para a entidade AtendimentoAssistencial.
 */
@Repository
public interface AtendimentoAssistencialRepository extends JpaRepository<AtendimentoAssistencial, Long> {
    
    /**
     * Busca atendimentos por unidade assistencial.
     * @param unidade A unidade assistencial.
     * @param pageable Paginação.
     * @return Os atendimentos encontrados.
     */
    Page<AtendimentoAssistencial> findByUnidade(UnidadeAssistencial unidade, Pageable pageable);
    
    /**
     * Busca atendimentos por paciente.
     * @param paciente O paciente.
     * @param pageable Paginação.
     * @return Os atendimentos encontrados.
     */
    @Query("SELECT a FROM AtendimentoAssistencial a JOIN a.pacientes p WHERE p = :paciente")
    Page<AtendimentoAssistencial> findByPaciente(@Param("paciente") Paciente paciente, Pageable pageable);
    
    /**
     * Busca atendimentos por paciente ID (sem paginação, para histórico unificado)
     * @param pacienteId ID do paciente.
     * @return Lista de atendimentos encontrados.
     */
    @Query("SELECT DISTINCT a FROM AtendimentoAssistencial a JOIN a.pacientes p WHERE p.id = :pacienteId ORDER BY a.dataHora DESC")
    List<AtendimentoAssistencial> findByPacienteId(@Param("pacienteId") Long pacienteId);
    
    /**
     * Busca atendimentos por família.
     * @param familia A família.
     * @param pageable Paginação.
     * @return Os atendimentos encontrados.
     */
    Page<AtendimentoAssistencial> findByFamilia(Familia familia, Pageable pageable);
    
    /**
     * Busca atendimentos por profissional.
     * @param profissional O profissional.
     * @param pageable Paginação.
     * @return Os atendimentos encontrados.
     */
    @Query("SELECT a FROM AtendimentoAssistencial a JOIN a.profissionais p WHERE p = :profissional")
    Page<AtendimentoAssistencial> findByProfissional(@Param("profissional") Operador profissional, Pageable pageable);
    
    /**
     * Busca atendimentos por serviço socioassistencial.
     * @param servico O serviço socioassistencial.
     * @param pageable Paginação.
     * @return Os atendimentos encontrados.
     */
    Page<AtendimentoAssistencial> findByServico(ServicoSocioassistencial servico, Pageable pageable);
    
    /**
     * Busca atendimentos por período.
     * @param dataInicio A data de início do período.
     * @param dataFim A data de fim do período.
     * @param pageable Paginação.
     * @return Os atendimentos encontrados.
     */
    Page<AtendimentoAssistencial> findByDataHoraBetween(LocalDateTime dataInicio, LocalDateTime dataFim, Pageable pageable);
    
    /**
     * Busca atendimentos por tipo de atendimentover.
     * @param tipoAtendimento O tipo de atendimentover.
     * @param pageable Paginação.
     * @return Os atendimentos encontrados.
     */
    Page<AtendimentoAssistencial> findByTipoAtendimento(AtendimentoAssistencial.TipoAtendimento tipoAtendimento, Pageable pageable);
    
    /**
     * Busca atendimentos por unidade assistencial e período.
     * @param unidade A unidade assistencial.
     * @param dataInicio A data de início do período.
     * @param dataFim A data de fim do período.
     * @param pageable Paginação.
     * @return Os atendimentos encontrados.
     */
    Page<AtendimentoAssistencial> findByUnidadeAndDataHoraBetween(UnidadeAssistencial unidade, LocalDateTime dataInicio, LocalDateTime dataFim, Pageable pageable);
    
    /**
     * Conta o número de atendimentos por unidade assistencial e período.
     * @param unidade A unidade assistencial.
     * @param dataInicio A data de início do período.
     * @param dataFim A data de fim do período.
     * @return O número de atendimentos.
     */
    long countByUnidadeAndDataHoraBetween(UnidadeAssistencial unidade, LocalDateTime dataInicio, LocalDateTime dataFim);
}
