package com.sistemadesaude.backend.operador.repository;

import com.sistemadesaude.backend.operador.entity.OperadorHorarioAcesso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Repositório para horários de acesso do operador.
 *
 * Observações:
 * - Mantive seu método original findByOperadorIdOrderByDiaSemanaAscHoraInicioAsc(...).
 * - ADICIONEI findByOperadorIdAndDiaSemana(...) para o AcessoValidator consultar
 *   somente os horários do dia atual (performático e direto).
 */
public interface OperadorHorarioAcessoRepository extends JpaRepository<OperadorHorarioAcesso, Long> {

    /**
     * Seu método original (mantido).
     * Lista todos os horários do operador ordenando por dia/hora.
     */
    List<OperadorHorarioAcesso> findByOperadorIdOrderByDiaSemanaAscHoraInicioAsc(Long operadorId);

    /**
     * 🔹 NOVO: retorna somente os horários do "diaSemana" informado.
     * Assumimos que sua entidade possui os campos:
     *  - operadorId (Long)
     *  - diaSemana (Integer, 1=segunda ... 7=domingo)
     *  - horaInicio (LocalTime) / horaFim (LocalTime)
     *
     * Ajuste os nomes dos campos se na sua entidade forem diferentes.
     */
    @Query("""
           SELECT h
             FROM OperadorHorarioAcesso h
            WHERE h.operadorId = :operadorId
              AND h.diaSemana  = :diaSemana
            ORDER BY h.horaInicio ASC
           """)
    List<OperadorHorarioAcesso> findByOperadorIdAndDiaSemana(@Param("operadorId") Long operadorId,
                                                             @Param("diaSemana") Integer diaSemana);
}
