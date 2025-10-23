package com.sistemadesaude.backend.hospitalar.repository;

import com.sistemadesaude.backend.hospitalar.entity.AcompanhanteInternacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AcompanhanteInternacaoRepository extends JpaRepository<AcompanhanteInternacao, Long> {

    // Buscar por internação
    List<AcompanhanteInternacao> findByInternacaoIdOrderByDataInicioAcompanhamentoDesc(Long internacaoId);

    // Buscar acompanhantes ativos por internação
    List<AcompanhanteInternacao> findByInternacaoIdAndStatusAcompanhamentoOrderByDataInicioAcompanhamento(
            Long internacaoId, AcompanhanteInternacao.StatusAcompanhamento status);

    // Buscar por CPF
    Optional<AcompanhanteInternacao> findByCpfAndInternacaoId(String cpf, Long internacaoId);

    // Buscar por status
    List<AcompanhanteInternacao> findByStatusAcompanhamentoOrderByDataInicioAcompanhamentoDesc(
            AcompanhanteInternacao.StatusAcompanhamento status);

    // Buscar acompanhantes ativos
    @Query("SELECT a FROM AcompanhanteInternacao a WHERE a.statusAcompanhamento = 'ATIVO' ORDER BY a.dataInicioAcompanhamento DESC")
    List<AcompanhanteInternacao> findAcompanhantesAtivos();

    // Buscar por grau de parentesco
    List<AcompanhanteInternacao> findByGrauParentescoAndStatusAcompanhamentoOrderByDataInicioAcompanhamento(
            AcompanhanteInternacao.GrauParentesco grauParentesco, AcompanhanteInternacao.StatusAcompanhamento status);

    // Buscar responsáveis legais ativos
    @Query("SELECT a FROM AcompanhanteInternacao a WHERE a.responsavelLegal = true AND a.statusAcompanhamento = 'ATIVO'")
    List<AcompanhanteInternacao> findResponsaveisLegaisAtivos();

    // Buscar por tipo de acompanhamento
    List<AcompanhanteInternacao> findByTipoAcompanhamentoAndStatusAcompanhamentoOrderByDataInicioAcompanhamento(
            AcompanhanteInternacao.TipoAcompanhamento tipoAcompanhamento, AcompanhanteInternacao.StatusAcompanhamento status);

    // Buscar acompanhantes que podem receber informações
    @Query("SELECT a FROM AcompanhanteInternacao a WHERE a.podeReceberInformacoes = true AND a.statusAcompanhamento = 'ATIVO' AND a.internacao.id = :internacaoId")
    List<AcompanhanteInternacao> findPodeReceberInformacoes(@Param("internacaoId") Long internacaoId);

    // Buscar acompanhantes que podem tomar decisões
    @Query("SELECT a FROM AcompanhanteInternacao a WHERE a.podeTomarDecisoes = true AND a.statusAcompanhamento = 'ATIVO' AND a.internacao.id = :internacaoId")
    List<AcompanhanteInternacao> findPodeTomarDecisoes(@Param("internacaoId") Long internacaoId);

    // Buscar por telefone
    List<AcompanhanteInternacao> findByTelefoneContainingOrderByDataInicioAcompanhamentoDesc(String telefone);

    // Buscar acompanhantes de revezamento ativos
    @Query("SELECT a FROM AcompanhanteInternacao a WHERE a.permiteRevezamento = true AND a.statusAcompanhamento = 'ATIVO'")
    List<AcompanhanteInternacao> findRevezamentoAtivos();

    // Estatísticas - Contar por status
    @Query("SELECT a.statusAcompanhamento, COUNT(a) FROM AcompanhanteInternacao a GROUP BY a.statusAcompanhamento")
    List<Object[]> countByStatus();

    // Estatísticas - Contar por tipo
    @Query("SELECT a.tipoAcompanhamento, COUNT(a) FROM AcompanhanteInternacao a WHERE a.statusAcompanhamento = 'ATIVO' GROUP BY a.tipoAcompanhamento")
    List<Object[]> countByTipoAtivos();

    // Estatísticas - Contar por grau de parentesco
    @Query("SELECT a.grauParentesco, COUNT(a) FROM AcompanhanteInternacao a WHERE a.statusAcompanhamento = 'ATIVO' GROUP BY a.grauParentesco")
    List<Object[]> countByParentescoAtivos();

    // Verificar se paciente já tem acompanhante ativo
    @Query("SELECT COUNT(a) > 0 FROM AcompanhanteInternacao a WHERE a.internacao.id = :internacaoId AND a.statusAcompanhamento = 'ATIVO'")
    boolean temAcompanhanteAtivo(@Param("internacaoId") Long internacaoId);

    // Buscar acompanhante principal (responsável legal ativo)
    @Query("SELECT a FROM AcompanhanteInternacao a WHERE a.internacao.id = :internacaoId AND a.responsavelLegal = true AND a.statusAcompanhamento = 'ATIVO'")
    Optional<AcompanhanteInternacao> findAcompanhantePrincipal(@Param("internacaoId") Long internacaoId);

    // Buscar histórico de acompanhantes de uma internação
    @Query("SELECT a FROM AcompanhanteInternacao a WHERE a.internacao.id = :internacaoId ORDER BY a.dataInicioAcompanhamento DESC")
    List<AcompanhanteInternacao> findHistoricoAcompanhantes(@Param("internacaoId") Long internacaoId);

    // Buscar acompanhantes com restrições médicas
    @Query("SELECT a FROM AcompanhanteInternacao a WHERE a.restricoesMedicas IS NOT NULL AND a.restricoesMedicas != '' AND a.statusAcompanhamento = 'ATIVO'")
    List<AcompanhanteInternacao> findComRestricoesMedicas();

    // Buscar por operador que registrou
    List<AcompanhanteInternacao> findByOperadorRegistroIdOrderByDataRegistroDesc(Long operadorId);
}