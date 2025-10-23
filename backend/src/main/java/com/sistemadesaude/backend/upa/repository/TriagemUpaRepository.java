package com.sistemadesaude.backend.upa.repository;

import com.sistemadesaude.backend.upa.entity.TriagemUpa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TriagemUpaRepository extends JpaRepository<TriagemUpa, Long> {

    /**
     * Triagens sem atendimento: usa a entidade AtendimentoUpa.
     * Se a tabela física (upa_atendimentos) não existir no banco legado, o service fará fallback.
     */
    @Query("""
            select t
            from TriagemUpa t
            left join AtendimentoUpa a on a.triagem.id = t.id
            where a.id is null
            order by t.criadoEm
            """)
    List<TriagemUpa> findTriadosSemAtendimento();

    @Query("select t from TriagemUpa t order by t.criadoEm")
    List<TriagemUpa> findAllOrderByCriadoEmAsc();
}
