package com.sistemadesaude.backend.operador.repository;

import com.sistemadesaude.backend.operador.entity.SetorAtendimento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SetorAtendimentoRepository extends JpaRepository<SetorAtendimento, Long> {
    List<SetorAtendimento> findByAtivoTrueOrderByNomeAsc();
}
