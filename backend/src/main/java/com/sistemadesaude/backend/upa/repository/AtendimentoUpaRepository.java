package com.sistemadesaude.backend.upa.repository;

import com.sistemadesaude.backend.upa.entity.AtendimentoUpa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/** Repositório de Atendimento UPA. */
public interface AtendimentoUpaRepository extends JpaRepository<AtendimentoUpa, Long> {
    
    /**
     * Busca atendimentos UPA por paciente ID
     * Usa JOIN FETCH para carregar relacionamentos necessários
     */
    @Query("SELECT DISTINCT a FROM AtendimentoUpa a " +
           "LEFT JOIN FETCH a.paciente p " +
           "LEFT JOIN FETCH a.triagem t " +
           "WHERE a.paciente.id = :pacienteId ORDER BY a.criadoEm DESC")
    List<AtendimentoUpa> findByPacienteId(@Param("pacienteId") Long pacienteId);
}
