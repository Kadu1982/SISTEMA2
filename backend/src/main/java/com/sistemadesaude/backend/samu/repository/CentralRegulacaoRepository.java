package com.sistemadesaude.backend.samu.repository;

import com.sistemadesaude.backend.samu.entity.CentralRegulacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CentralRegulacaoRepository extends JpaRepository<CentralRegulacao, Long> {
}
