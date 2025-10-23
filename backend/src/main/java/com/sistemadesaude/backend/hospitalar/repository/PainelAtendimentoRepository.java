package com.sistemadesaude.backend.hospitalar.repository;

import com.sistemadesaude.backend.hospitalar.entity.PainelAtendimento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PainelAtendimentoRepository extends JpaRepository<PainelAtendimento, Long> {

    List<PainelAtendimento> findByAtivo(boolean ativo);

    List<PainelAtendimento> findByUnidadeId(Long unidadeId);

    List<PainelAtendimento> findBySetorId(Long setorId);

    List<PainelAtendimento> findByFilaId(Long filaId);

    @Query("SELECT pa FROM PainelAtendimento pa WHERE pa.unidade.id = :unidadeId AND pa.ativo = true")
    List<PainelAtendimento> findAtivosByUnidade(@Param("unidadeId") Long unidadeId);

    @Query("SELECT pa FROM PainelAtendimento pa WHERE pa.setorId = :setorId AND pa.ativo = true")
    List<PainelAtendimento> findAtivosBySetor(@Param("setorId") Long setorId);

    @Query("SELECT pa FROM PainelAtendimento pa WHERE pa.fila.id = :filaId AND pa.ativo = true")
    List<PainelAtendimento> findAtivosByFila(@Param("filaId") Long filaId);

    Optional<PainelAtendimento> findByNome(String nome);

    @Query("SELECT pa FROM PainelAtendimento pa WHERE pa.localizacao = :localizacao AND pa.ativo = true")
    List<PainelAtendimento> findByLocalizacaoAtivo(@Param("localizacao") String localizacao);

    @Query("SELECT pa FROM PainelAtendimento pa WHERE pa.chamadaComSom = true AND pa.ativo = true")
    List<PainelAtendimento> findPaineisComSom();

    @Query("SELECT pa FROM PainelAtendimento pa WHERE pa.chamadaComVoz = true AND pa.ativo = true")
    List<PainelAtendimento> findPaineisComVoz();

    @Query("SELECT pa FROM PainelAtendimento pa WHERE pa.exibirMultimedia = true AND pa.ativo = true")
    List<PainelAtendimento> findPaineisComMultimedia();

    @Query("SELECT COUNT(pa) FROM PainelAtendimento pa WHERE pa.unidade.id = :unidadeId AND pa.ativo = true")
    Long countAtivosByUnidade(@Param("unidadeId") Long unidadeId);

    @Query("SELECT pa FROM PainelAtendimento pa WHERE pa.unidade.id = :unidadeId AND " +
            "pa.setorId = :setorId AND pa.ativo = true")
    List<PainelAtendimento> findByUnidadeAndSetor(
            @Param("unidadeId") Long unidadeId,
            @Param("setorId") Long setorId);
}