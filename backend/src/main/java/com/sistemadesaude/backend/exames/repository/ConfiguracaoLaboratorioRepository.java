package com.sistemadesaude.backend.exames.repository;

import com.sistemadesaude.backend.exames.entity.ConfiguracaoLaboratorio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConfiguracaoLaboratorioRepository extends JpaRepository<ConfiguracaoLaboratorio, Long> {

    Optional<ConfiguracaoLaboratorio> findByUnidadeId(Long unidadeId);
}