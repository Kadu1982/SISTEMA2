package com.sistemadesaude.backend.samu.repository;

import com.sistemadesaude.backend.samu.entity.ConfiguracaoSamu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConfiguracaoSamuRepository extends JpaRepository<ConfiguracaoSamu, Long> {

    /**
     * Busca configuração por unidade de saúde
     * Usa o caminho correto para o ID da unidade através da relação
     */
    Optional<ConfiguracaoSamu> findByUnidade_Id(Long unidadeId);

    /**
     * Verifica se existe configuração para a unidade
     * Usa o caminho correto para o ID da unidade através da relação
     */
    boolean existsByUnidade_Id(Long unidadeId);
}
