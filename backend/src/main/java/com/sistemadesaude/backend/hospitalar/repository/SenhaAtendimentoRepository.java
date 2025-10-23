package com.sistemadesaude.backend.hospitalar.repository;

import com.sistemadesaude.backend.hospitalar.entity.SenhaAtendimento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SenhaAtendimentoRepository extends JpaRepository<SenhaAtendimento, Long> {

    List<SenhaAtendimento> findByFilaIdAndStatusOrderBySequencia(Long filaId, SenhaAtendimento.StatusSenha status);

    List<SenhaAtendimento> findByFilaIdAndStatusInOrderBySequencia(Long filaId, List<SenhaAtendimento.StatusSenha> status);

    Optional<SenhaAtendimento> findByNumeroSenhaAndFilaId(String numeroSenha, Long filaId);

    @Query("SELECT s FROM SenhaAtendimento s WHERE s.fila.id = :filaId AND s.status = 'AGUARDANDO' ORDER BY s.tipoSenha DESC, s.sequencia ASC")
    List<SenhaAtendimento> findProximasSenhasParaChamada(@Param("filaId") Long filaId);

    @Query("SELECT s FROM SenhaAtendimento s WHERE s.fila.id = :filaId AND s.status = 'CHAMADA' ORDER BY s.dataChamada DESC")
    List<SenhaAtendimento> findUltimasSenhasChamadas(@Param("filaId") Long filaId);

    @Query("SELECT COUNT(s) FROM SenhaAtendimento s WHERE s.fila.id = :filaId AND s.status = 'AGUARDANDO' AND s.tipoSenha = :tipoSenha")
    Long countSenhasAguardandoPorTipo(@Param("filaId") Long filaId, @Param("tipoSenha") SenhaAtendimento.TipoSenha tipoSenha);

    @Query(value = "SELECT AVG(EXTRACT(EPOCH FROM (data_atendimento - data_emissao))/60) FROM senha_atendimento WHERE fila_id = :filaId AND data_emissao >= :dataInicio AND data_atendimento IS NOT NULL", nativeQuery = true)
    Double calcularTempoMedioEspera(@Param("filaId") Long filaId, @Param("dataInicio") LocalDateTime dataInicio);

    @Query("SELECT s FROM SenhaAtendimento s WHERE s.dataEmissao >= :dataInicio AND s.dataEmissao <= :dataFim")
    List<SenhaAtendimento> findByPeriodo(@Param("dataInicio") LocalDateTime dataInicio, @Param("dataFim") LocalDateTime dataFim);

    @Query(value = "SELECT MAX(sequencia) FROM senha_atendimento WHERE fila_id = :filaId AND DATE(data_emissao) = CURRENT_DATE", nativeQuery = true)
    Optional<Integer> findUltimaSequenciaDoDia(@Param("filaId") Long filaId);

    List<SenhaAtendimento> findByPacienteIdAndDataEmissaoBetween(Long pacienteId, LocalDateTime inicio, LocalDateTime fim);
}