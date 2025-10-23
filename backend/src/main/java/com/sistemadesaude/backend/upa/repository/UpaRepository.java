package com.sistemadesaude.backend.upa.repository;

import com.sistemadesaude.backend.upa.entity.Upa;
import com.sistemadesaude.backend.upa.enums.UpaStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Repositório da UPA com:
 *  - Projeções nativas *leves* (retornam só o que a tela precisa)
 *  - Consultas derivadas por JPA
 *  - JPQL para “aguardando triagem”
 *
 * IMPORTANTE:
 *  - Sua entidade Paciente está anotada com @Table(name = "pacientes") → as queries nativas usam TABELA NO PLURAL.
 *    Se no seu banco a tabela for "paciente" (singular), troque no JOIN.
 *  - A tabela de triagem é "upa_triagem" e a FK é "upa_id".
 */
public interface UpaRepository extends JpaRepository<Upa, Long> {

    /* ==================== PROJEÇÃO NATIVA (LEVE) ==================== */

    interface BasicUpaRow {
        Long getId();
        Long getPacienteId();
        Timestamp getDataHoraRegistro();
        String getObservacoes();
        String getPacienteNome();
    }

    /** 1) Todas as UPAs ativas (com nome do paciente), ordem DESC por data/hora */
    @Query(value = """
        SELECT 
            u.id                      AS id,
            u.paciente_id             AS pacienteId,
            u.data_hora_registro      AS dataHoraRegistro,
            u.observacoes             AS observacoes,
            p.nome                    AS pacienteNome
        FROM upa u
        LEFT JOIN pacientes p ON p.id = u.paciente_id  -- troque para 'paciente' se a sua tabela for singular
        WHERE u.ativo = TRUE
        ORDER BY u.data_hora_registro DESC
    """, nativeQuery = true)
    List<BasicUpaRow> findAllBasic();

    /** 2) UPAs ativas de um paciente (com nome do paciente), ordem DESC */
    @Query(value = """
        SELECT 
            u.id                      AS id,
            u.paciente_id             AS pacienteId,
            u.data_hora_registro      AS dataHoraRegistro,
            u.observacoes             AS observacoes,
            p.nome                    AS pacienteNome
        FROM upa u
        LEFT JOIN pacientes p ON p.id = u.paciente_id
        WHERE u.ativo = TRUE
          AND u.paciente_id = :pacienteId
        ORDER BY u.data_hora_registro DESC
    """, nativeQuery = true)
    List<BasicUpaRow> findByPacienteIdBasic(@Param("pacienteId") Long pacienteId);

    /** 3) UPAs aguardando triagem: ativas e SEM registro correspondente em upa_triagem */
    @Query(value = """
        SELECT 
            u.id                      AS id,
            u.paciente_id             AS pacienteId,
            u.data_hora_registro      AS dataHoraRegistro,
            u.observacoes             AS observacoes,
            p.nome                    AS pacienteNome
        FROM upa u
        LEFT JOIN pacientes p ON p.id = u.paciente_id
        WHERE u.ativo = TRUE
          AND NOT EXISTS (
              SELECT 1
              FROM upa_triagem t
              WHERE t.upa_id = u.id
          )
        ORDER BY u.data_hora_registro ASC
    """, nativeQuery = true)
    List<BasicUpaRow> findAguardandoTriagemBasic();

    /** 4A) (Opcional) UPAs ativas por período – resposta leve */
    @Query(value = """
        SELECT 
            u.id                      AS id,
            u.paciente_id             AS pacienteId,
            u.data_hora_registro      AS dataHoraRegistro,
            u.observacoes             AS observacoes,
            p.nome                    AS pacienteNome
        FROM upa u
        LEFT JOIN pacientes p ON p.id = u.paciente_id
        WHERE u.ativo = TRUE
          AND u.data_hora_registro BETWEEN :inicio AND :fim
        ORDER BY u.data_hora_registro DESC
    """, nativeQuery = true)
    List<BasicUpaRow> findByPeriodoBasic(@Param("inicio") LocalDateTime inicio,
                                         @Param("fim") LocalDateTime fim);

    /** 4B) (Opcional) Contagem por status – nativa */
    @Query(value = """
        SELECT COUNT(*) 
        FROM upa u
        WHERE u.ativo = TRUE
          AND u.status = :status
    """, nativeQuery = true)
    long countByStatusBasic(@Param("status") String status);

    /* ==================== CONSULTAS JPA DERIVADAS ==================== */

    List<Upa> findByAtivoTrueOrderByDataHoraRegistroDesc();

    List<Upa> findByAtivoTrueAndStatusOrderByDataHoraRegistroDesc(UpaStatus status);

    List<Upa> findByAtivoTrueAndPaciente_IdOrderByDataHoraRegistroDesc(Long pacienteId);

    List<Upa> findByAtivoTrueAndDataHoraRegistroBetweenOrderByDataHoraRegistroDesc(LocalDateTime inicio,
                                                                                   LocalDateTime fim);

    long countByStatusAndAtivoTrue(UpaStatus status);

    /* ==================== JPQL: AGUARDANDO TRIAGEM ==================== */
    /**
     * Lista entidades UPA ativas que ainda não possuem triagem.
     * Requer que sua entidade TriagemUpa tenha um @ManyToOne para Upa com o
     * nome do campo "upa" (o usual).
     */
    @Query("""
        select u
        from Upa u
        where u.ativo = true
          and not exists (
              select t.id
              from TriagemUpa t
              where t.upa.id = u.id
          )
        order by u.dataHoraRegistro asc
    """)
    List<Upa> findAguardandoTriagem();
}
