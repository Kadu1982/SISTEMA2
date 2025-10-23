package com.sistemadesaude.backend.exames.repository;

import com.sistemadesaude.backend.exames.entity.MotivoNovaColeta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MotivoNovaColetaRepository extends JpaRepository<MotivoNovaColeta, Long> {

    Optional<MotivoNovaColeta> findByCodigo(String codigo);

    List<MotivoNovaColeta> findByAtivoTrue();
}