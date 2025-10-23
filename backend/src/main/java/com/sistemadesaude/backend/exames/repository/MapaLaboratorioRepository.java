package com.sistemadesaude.backend.exames.repository;

import com.sistemadesaude.backend.exames.entity.MapaLaboratorio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MapaLaboratorioRepository extends JpaRepository<MapaLaboratorio, Long> {

    Optional<MapaLaboratorio> findByCodigo(String codigo);

    List<MapaLaboratorio> findByAtivoTrueOrderByOrdemAsc();

    List<MapaLaboratorio> findBySetor(String setor);
}