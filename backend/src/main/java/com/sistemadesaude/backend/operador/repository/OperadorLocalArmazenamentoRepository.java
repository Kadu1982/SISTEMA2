package com.sistemadesaude.backend.operador.repository;

import com.sistemadesaude.backend.operador.entity.OperadorLocalArmazenamento;
import com.sistemadesaude.backend.operador.entity.OperadorLocalArmazenamentoId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Repositório para o vínculo Operador ↔ Local de Armazenamento.
 *
 * Notas:
 * - A entidade usa chave composta (OperadorLocalArmazenamentoId) com campos:
 *   operadorId e localId.
 * - Os métodos abaixo são usados pelo OperadorLocaisController:
 *   • listarLocaisPermitidos(operadorId) → GET
 *   • deleteByIdOperadorId(operadorId)   → PUT (limpa vínculos antes de recriar)
 */
public interface OperadorLocalArmazenamentoRepository
        extends JpaRepository<OperadorLocalArmazenamento, OperadorLocalArmazenamentoId> {

    /**
     * Retorna somente os IDs dos Locais liberados para o operador.
     */
    @Query("select ola.id.localId from OperadorLocalArmazenamento ola where ola.id.operadorId = :operadorId")
    List<Long> listarLocaisPermitidos(@Param("operadorId") Long operadorId);

    /**
     * Remove todos os vínculos do operador com locais de armazenamento.
     * Usamos @Modifying + @Transactional porque é um DELETE em massa.
     *
     * Observação: o nome do método foi mantido igual ao usado no controller
     * (deleteByIdOperadorId) para não precisar alterar o controller.
     */
    @Modifying
    @Transactional
    @Query("delete from OperadorLocalArmazenamento ola where ola.id.operadorId = :operadorId")
    void deleteByIdOperadorId(@Param("operadorId") Long operadorId);
}
