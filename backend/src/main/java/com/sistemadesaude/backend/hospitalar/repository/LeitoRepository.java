package com.sistemadesaude.backend.hospitalar.repository;

import com.sistemadesaude.backend.hospitalar.entity.Leito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeitoRepository extends JpaRepository<Leito, Long> {

    List<Leito> findByAtivoTrueOrderByEnfermariaAscNumeroAsc();

    List<Leito> findByUnidade_IdAndAtivoTrueOrderByEnfermariaAscNumeroAsc(Long unidadeId);

    List<Leito> findByEnfermariaAndAtivoTrueOrderByNumero(String enfermaria);

    List<Leito> findByStatusAndAtivoTrue(Leito.StatusLeito status);

    List<Leito> findByStatusAndUnidade_IdAndAtivoTrue(Leito.StatusLeito status, Long unidadeId);

    List<Leito> findByTipoAcomodacaoAndStatusAndAtivoTrue(Leito.TipoAcomodacao tipoAcomodacao, Leito.StatusLeito status);

    Optional<Leito> findByNumeroAndEnfermariaAndUnidade_Id(String numero, String enfermaria, Long unidadeId);

    @Query("SELECT l FROM Leito l WHERE l.paciente.id = :pacienteId AND l.status = 'OCUPADO' AND l.ativo = true")
    Optional<Leito> findByPacienteOcupado(@Param("pacienteId") Long pacienteId);

    @Query("SELECT COUNT(l) FROM Leito l WHERE l.status = :status AND l.unidade.id = :unidadeId AND l.ativo = true")
    Long countByStatusAndUnidade(@Param("status") Leito.StatusLeito status, @Param("unidadeId") Long unidadeId);

    @Query("SELECT l.status, COUNT(l) FROM Leito l WHERE l.unidade.id = :unidadeId AND l.ativo = true GROUP BY l.status")
    List<Object[]> countLeitosPorStatusNaUnidade(@Param("unidadeId") Long unidadeId);

    @Query("SELECT l.enfermaria, l.status, COUNT(l) FROM Leito l WHERE l.unidade.id = :unidadeId AND l.ativo = true GROUP BY l.enfermaria, l.status")
    List<Object[]> countLeitosPorEnfermariaEStatus(@Param("unidadeId") Long unidadeId);

    @Query("SELECT l FROM Leito l WHERE l.statusLimpeza = 'AGUARDANDO_LIMPEZA' AND l.ativo = true ORDER BY l.dataLiberacao")
    List<Leito> findLeitosAguardandoLimpeza();

    boolean existsByNumeroAndEnfermariaAndUnidade_IdAndIdNot(String numero, String enfermaria, Long unidadeId, Long id);
}