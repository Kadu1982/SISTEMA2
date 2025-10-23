package com.sistemadesaude.backend.hospitalar.repository;

import com.sistemadesaude.backend.hospitalar.entity.FilaAtendimento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FilaAtendimentoRepository extends JpaRepository<FilaAtendimento, Long> {

    List<FilaAtendimento> findByAtivoTrueOrderByNome();

    List<FilaAtendimento> findByUnidade_IdAndAtivoTrue(Long unidadeId);

    List<FilaAtendimento> findBySetorIdAndAtivoTrue(Long setorId);

    Optional<FilaAtendimento> findByPrefixoSenhaAndUnidade_Id(String prefixoSenha, Long unidadeId);

    @Query("SELECT f FROM FilaAtendimento f WHERE f.ativo = true AND CURRENT_TIME BETWEEN f.horarioInicio AND f.horarioFim")
    List<FilaAtendimento> findFilasAtivasNoHorario();

    @Query("SELECT f FROM FilaAtendimento f WHERE f.unidade.id = :unidadeId AND f.ativo = true AND CURRENT_TIME BETWEEN f.horarioInicio AND f.horarioFim")
    List<FilaAtendimento> findFilasAtivasNoHorarioPorUnidade(@Param("unidadeId") Long unidadeId);

    @Query("SELECT COUNT(s) FROM SenhaAtendimento s WHERE s.fila.id = :filaId AND s.status IN ('AGUARDANDO', 'CHAMADA')")
    Long countSenhasAguardandoPorFila(@Param("filaId") Long filaId);

    boolean existsByPrefixoSenhaAndUnidade_IdAndIdNot(String prefixoSenha, Long unidadeId, Long id);
}