package com.sistemadesaude.backend.recepcao.repository;

import com.sistemadesaude.backend.recepcao.entity.ConfiguracaoRecepcao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConfiguracaoRecepcaoRepository extends JpaRepository<ConfiguracaoRecepcao, Long> {
}
