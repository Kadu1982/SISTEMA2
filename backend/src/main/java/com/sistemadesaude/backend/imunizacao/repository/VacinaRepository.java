package com.sistemadesaude.backend.imunizacao.repository;

import com.sistemadesaude.backend.imunizacao.entity.Vacina;
import com.sistemadesaude.backend.imunizacao.enums.TipoVacina;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VacinaRepository extends JpaRepository<Vacina, Long> {

    Optional<Vacina> findByCodigo(String codigo);

    List<Vacina> findByAtivaTrue();

    List<Vacina> findByTipoVacina(TipoVacina tipoVacina);

    List<Vacina> findByCalendarioVacinalTrueAndAtivaTrue();

    List<Vacina> findByExportarRndsTrueAndCalendarioVacinalTrueAndAtivaTrue();

    @Query("SELECT v FROM Vacina v WHERE " +
           "(:ativa IS NULL OR v.ativa = :ativa) AND " +
           "(:tipoVacina IS NULL OR v.tipoVacina = :tipoVacina) AND " +
           "(LOWER(v.nome) LIKE LOWER(CONCAT('%', :busca, '%')) OR " +
           " LOWER(v.codigo) LIKE LOWER(CONCAT('%', :busca, '%')))")
    Page<Vacina> buscarComFiltros(
        @Param("ativa") Boolean ativa,
        @Param("tipoVacina") TipoVacina tipoVacina,
        @Param("busca") String busca,
        Pageable pageable
    );

    @Query("SELECT COUNT(v) FROM Vacina v WHERE v.ativa = true")
    Long countVacinasAtivas();

    @Query("SELECT COUNT(v) FROM Vacina v WHERE v.calendarioVacinal = true AND v.ativa = true")
    Long countVacinasCalendario();
}