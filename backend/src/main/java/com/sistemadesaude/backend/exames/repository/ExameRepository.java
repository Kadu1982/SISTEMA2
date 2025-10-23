package com.sistemadesaude.backend.exames.repository;

import com.sistemadesaude.backend.exames.entity.Exame;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExameRepository extends JpaRepository<Exame, Long> {

    Optional<Exame> findByCodigo(String codigo);

    List<Exame> findByAtivoTrue();

    List<Exame> findByGrupoIdAndAtivoTrue(Long grupoId);

    @Query("SELECT e FROM Exame e WHERE e.ativo = true AND " +
           "(LOWER(e.nome) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(e.codigo) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(e.sinonimo) LIKE LOWER(CONCAT('%', :termo, '%')))")
    List<Exame> buscarPorTermo(@Param("termo") String termo);

    List<Exame> findByCodigoSigtap(String codigoSigtap);

    List<Exame> findByCodigoTuss(String codigoTuss);

    @Query("SELECT e FROM Exame e WHERE e.ativo = true AND e.permiteAgendamento = true")
    List<Exame> findExamesAgendaveis();
}