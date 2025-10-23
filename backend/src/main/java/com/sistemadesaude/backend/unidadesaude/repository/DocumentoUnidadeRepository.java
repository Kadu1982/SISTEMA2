package com.sistemadesaude.backend.unidadesaude.repository;

import com.sistemadesaude.backend.unidadesaude.entity.DocumentoUnidade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentoUnidadeRepository extends JpaRepository<DocumentoUnidade, Long> {
    List<DocumentoUnidade> findByUnidade_Id(Long unidadeId);
}
