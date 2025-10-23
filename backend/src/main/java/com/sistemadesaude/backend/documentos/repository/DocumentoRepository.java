package com.sistemadesaude.backend.documentos.repository;

import com.sistemadesaude.backend.documentos.entity.Documento;
import com.sistemadesaude.backend.documentos.entity.Documento.TipoDocumento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository para gerenciar operações de acesso a dados da entidade Documento.
 * CONFORME ISSUE: Suporte para persistência e reimpressão de documentos PDF.
 */
@Repository
public interface DocumentoRepository extends JpaRepository<Documento, Long> {

    /**
     * Busca documentos ativos por paciente, ordenados por data de criação (mais recente primeiro)
     */
    @Query("SELECT d FROM Documento d WHERE d.paciente.id = :pacienteId AND d.ativo = true ORDER BY d.createdAt DESC")
    List<Documento> findByPacienteIdAndAtivoTrueOrderByCreatedAtDesc(@Param("pacienteId") Long pacienteId);

    /**
     * Busca documentos por paciente e tipo específico
     */
    @Query("SELECT d FROM Documento d WHERE d.paciente.id = :pacienteId AND d.tipo = :tipo AND d.ativo = true ORDER BY d.createdAt DESC")
    List<Documento> findByPacienteIdAndTipoAndAtivoTrueOrderByCreatedAtDesc(
            @Param("pacienteId") Long pacienteId, 
            @Param("tipo") TipoDocumento tipo);

    /**
     * Busca documento por ID, garantindo que esteja ativo
     */
    @Query("SELECT d FROM Documento d WHERE d.id = :id AND d.ativo = true")
    Optional<Documento> findByIdAndAtivoTrue(@Param("id") Long id);

    /**
     * Busca documentos por hash (para evitar duplicatas)
     */
    List<Documento> findByHashAndAtivoTrue(String hash);

    /**
     * Busca documentos criados dentro de um período específico
     */
    @Query("SELECT d FROM Documento d WHERE d.createdAt BETWEEN :inicio AND :fim AND d.ativo = true ORDER BY d.createdAt DESC")
    List<Documento> findByCreatedAtBetweenAndAtivoTrueOrderByCreatedAtDesc(
            @Param("inicio") LocalDateTime inicio, 
            @Param("fim") LocalDateTime fim);

    /**
     * Busca documentos por tipo dentro de um período
     */
    @Query("SELECT d FROM Documento d WHERE d.tipo = :tipo AND d.createdAt BETWEEN :inicio AND :fim AND d.ativo = true ORDER BY d.createdAt DESC")
    List<Documento> findByTipoAndCreatedAtBetweenAndAtivoTrueOrderByCreatedAtDesc(
            @Param("tipo") TipoDocumento tipo,
            @Param("inicio") LocalDateTime inicio, 
            @Param("fim") LocalDateTime fim);

    /**
     * Conta quantos documentos um paciente possui por tipo
     */
    @Query("SELECT COUNT(d) FROM Documento d WHERE d.paciente.id = :pacienteId AND d.tipo = :tipo AND d.ativo = true")
    long countByPacienteIdAndTipoAndAtivoTrue(@Param("pacienteId") Long pacienteId, @Param("tipo") TipoDocumento tipo);

    /**
     * Busca documentos órfãos (arquivo não existe no sistema de arquivos)
     * Útil para limpeza/manutenção
     */
    @Query("SELECT d FROM Documento d WHERE d.ativo = true ORDER BY d.createdAt ASC")
    List<Documento> findAllAtivoOrderByCreatedAtAsc();

    /**
     * Busca os documentos mais recentes de um paciente (limitado)
     * Útil para dashboards e visualização rápida
     */
    @Query(value = "SELECT d FROM Documento d WHERE d.paciente.id = :pacienteId AND d.ativo = true ORDER BY d.createdAt DESC")
    List<Documento> findTop10ByPacienteIdAndAtivoTrueOrderByCreatedAtDesc(@Param("pacienteId") Long pacienteId);

    /**
     * Marca documento como inativo (soft delete)
     */
    @Query("UPDATE Documento d SET d.ativo = false WHERE d.id = :id")
    void marcarComoInativo(@Param("id") Long id);

    /**
     * Busca documentos por nome de arquivo (busca parcial)
     */
    @Query("SELECT d FROM Documento d WHERE d.nomeArquivo ILIKE %:nomeArquivo% AND d.ativo = true ORDER BY d.createdAt DESC")
    List<Documento> findByNomeArquivoContainingIgnoreCaseAndAtivoTrueOrderByCreatedAtDesc(@Param("nomeArquivo") String nomeArquivo);

    /**
     * Estatísticas: conta documentos por tipo para um período
     */
    @Query("SELECT d.tipo, COUNT(d) FROM Documento d WHERE d.createdAt BETWEEN :inicio AND :fim AND d.ativo = true GROUP BY d.tipo")
    List<Object[]> countByTipoAndCreatedAtBetweenAndAtivoTrue(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    /**
     * Verifica se existe documento com hash específico (para evitar duplicatas)
     */
    boolean existsByHashAndAtivoTrue(String hash);

    /**
     * Busca documentos que podem precisar de limpeza (muito antigos)
     */
    @Query("SELECT d FROM Documento d WHERE d.createdAt < :dataLimite AND d.ativo = true")
    List<Documento> findDocumentosAntigos(@Param("dataLimite") LocalDateTime dataLimite);
}