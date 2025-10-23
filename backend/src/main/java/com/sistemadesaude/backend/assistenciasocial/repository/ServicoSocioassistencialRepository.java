package com.sistemadesaude.backend.assistenciasocial.repository;

import com.sistemadesaude.backend.assistenciasocial.entity.ServicoSocioassistencial;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository para a entidade ServicoSocioassistencial.
 */
@Repository
public interface ServicoSocioassistencialRepository extends JpaRepository<ServicoSocioassistencial, Long> {

    /**
     * Busca um serviço socioassistencial pelo nome.
     * @param nome O nome do serviço socioassistencial.
     * @return O serviço socioassistencial encontrado.
     */
    Optional<ServicoSocioassistencial> findByNome(String nome);

    /**
     * Busca serviços socioassistenciais pelo nome contendo o texto informado, ignorando case.
     * @param nome O texto a ser buscado no nome do serviço socioassistencial.
     * @param pageable Paginação.
     * @return Os serviços socioassistenciais encontrados.
     */
    Page<ServicoSocioassistencial> findByNomeContainingIgnoreCase(String nome, Pageable pageable);

    /**
     * Busca serviços socioassistenciais ativos.
     * @return Os serviços socioassistenciais ativos.
     */
    List<ServicoSocioassistencial> findByAtivoTrue();

    /**
     * Busca serviços socioassistenciais ativos, paginado.
     * @param pageable Paginação.
     * @return Os serviços socioassistenciais ativos.
     */
    Page<ServicoSocioassistencial> findByAtivoTrue(Pageable pageable);

    /**
     * Busca serviços socioassistenciais com vagas disponíveis.
     * @return Os serviços socioassistenciais com vagas disponíveis.
     */
    @Query("SELECT s FROM ServicoSocioassistencial s WHERE s.ativo = true AND " +
           "(s.quantidadeVagas IS NULL OR " +
           "(SELECT COUNT(sa) FROM AtendimentoAssistencial sa WHERE sa.servico = s) < s.quantidadeVagas)")
    List<ServicoSocioassistencial> findWithAvailableVacancies();
}
