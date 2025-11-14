package com.sistemadesaude.backend.paciente.repository;

import com.sistemadesaude.backend.paciente.entity.Paciente;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Interface de repositório para a entidade Paciente.
 */
@Repository
public interface PacienteRepository extends JpaRepository<Paciente, Long> {

    Optional<Paciente> findByCpf(String cpf);

    Optional<Paciente> findByCns(String cns);

    /**
     * ✅ CORRIGIDO: O nome do método foi alterado para 'StartingWith'.
     * Isso muda a consulta SQL de "LIKE '%termo%'" para "LIKE 'termo%'",
     * que é a regra de negócio correta para "começa com".
     */
    List<Paciente> findByNomeCompletoStartingWithIgnoreCase(String nome, Pageable pageable);

    boolean existsByCpf(String cpf);

    boolean existsByCns(String cns);

    /**
     * Busca pacientes por múltiplos critérios usando query personalizada.
     * Busca por:
     * - Nome completo (startsWith - mais eficiente)
     * - CPF (exato ou parcial quando tiver 3+ dígitos)
     * - CNS (exato ou parcial quando tiver 3+ dígitos)
     * - Nome social (contains)
     * - Nome da mãe (contains)
     */
    @Query("""
        SELECT p FROM Paciente p
        WHERE (
            (:termo IS NOT NULL AND :termo != '' AND LOWER(p.nomeCompleto) LIKE LOWER(CONCAT(:termo, '%')))
            OR (:termo IS NOT NULL AND :termo != '' AND p.nomeSocial IS NOT NULL AND LOWER(p.nomeSocial) LIKE LOWER(CONCAT('%', :termo, '%')))
            OR (:termo IS NOT NULL AND :termo != '' AND p.nomeMae IS NOT NULL AND LOWER(p.nomeMae) LIKE LOWER(CONCAT('%', :termo, '%')))
        )
        OR (
            (:termoSemMascara IS NOT NULL AND :termoSemMascara != '' AND LENGTH(:termoSemMascara) >= 3 AND (
                p.cpf = :termoSemMascara
                OR p.cpf LIKE CONCAT(:termoSemMascara, '%')
                OR p.cns = :termoSemMascara
                OR p.cns LIKE CONCAT(:termoSemMascara, '%')
            ))
        )
        ORDER BY 
            CASE 
                WHEN (:termo IS NOT NULL AND :termo != '' AND LOWER(p.nomeCompleto) LIKE LOWER(CONCAT(:termo, '%'))) THEN 1
                WHEN (:termoSemMascara IS NOT NULL AND :termoSemMascara != '' AND p.cpf = :termoSemMascara) THEN 2
                WHEN (:termoSemMascara IS NOT NULL AND :termoSemMascara != '' AND p.cns = :termoSemMascara) THEN 3
                WHEN (:termoSemMascara IS NOT NULL AND :termoSemMascara != '' AND LENGTH(:termoSemMascara) >= 3 AND (p.cpf LIKE CONCAT(:termoSemMascara, '%') OR p.cns LIKE CONCAT(:termoSemMascara, '%'))) THEN 4
                ELSE 5
            END,
            p.nomeCompleto ASC
        """)
    List<Paciente> buscarPorMultiplosCriterios(
            @Param("termo") String termo,
            @Param("termoSemMascara") String termoSemMascara);
}
