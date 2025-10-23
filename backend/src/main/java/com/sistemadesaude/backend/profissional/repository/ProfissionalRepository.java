package com.sistemadesaude.backend.profissional.repository;

import com.sistemadesaude.backend.profissional.entity.Profissional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProfissionalRepository extends JpaRepository<Profissional, Long> {

    @Query("""
           select p from Profissional p
           where (:q is null or lower(p.nomeCompleto) like lower(concat('%', :q, '%'))
                  or p.documentos.cpf = :q or p.cns = :q)
           """)
    List<Profissional> buscarPorQuery(String q);
}
