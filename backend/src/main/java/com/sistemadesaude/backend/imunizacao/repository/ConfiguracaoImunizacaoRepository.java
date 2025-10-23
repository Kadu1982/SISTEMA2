package com.sistemadesaude.backend.imunizacao.repository;

import com.sistemadesaude.backend.imunizacao.entity.ConfiguracaoImunizacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConfiguracaoImunizacaoRepository extends JpaRepository<ConfiguracaoImunizacao, Long> {

    Optional<ConfiguracaoImunizacao> findByUnidadeId(Long unidadeId);

    List<ConfiguracaoImunizacao> findByExportarRndsTrue();

    List<ConfiguracaoImunizacao> findByExportarEsusAbTrue();

    List<ConfiguracaoImunizacao> findByExportarSipniTrue();

    @Query("SELECT c FROM ConfiguracaoImunizacao c WHERE c.ativo = true AND c.unidade.id = :unidadeId")
    Optional<ConfiguracaoImunizacao> findConfiguracoesAtivasPorUnidade(@Param("unidadeId") Long unidadeId);

    @Query("SELECT c FROM ConfiguracaoImunizacao c WHERE c.exportarRnds = true AND c.exportarEsusAb = false")
    List<ConfiguracaoImunizacao> findUnidadesQueExportamApenasParaRnds();
}