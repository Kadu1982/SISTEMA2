package com.sistemadesaude.backend.operador.repository;

import com.sistemadesaude.backend.operador.entity.OperadorUnidade;
import com.sistemadesaude.backend.operador.entity.key.OperadorUnidadeKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

/**
 * Repositório JPA para a tabela de junção operador_unidade.
 *
 * IMPORTANTE:
 * - Este repositório usa a entidade gerenciada OperadorUnidade + chave composta OperadorUnidadeKey.
 * - NÃO use entidade "dummy" (TempVoidEntity): isso provoca "Not a managed type".
 */
public interface OperadorUnidadeRepository extends JpaRepository<OperadorUnidade, OperadorUnidadeKey> {

    /**
     * Lista todos os vínculos (unidades) de um operador.
     * Ex.: SELECT * FROM operador_unidade WHERE operador_id = :operadorId
     */
    List<OperadorUnidade> findByIdOperadorId(Long operadorId);

    /**
     * (Opcional, utilitário) Deleta todos os vínculos de um operador.
     * Útil se você preferir não carregar e dar deleteAll na lista.
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM OperadorUnidade ou WHERE ou.id.operadorId = :operadorId")
    void deleteByOperadorId(@Param("operadorId") Long operadorId);

    /**
     * (Opcional) Retorna apenas os IDs de unidade vinculados ao operador.
     * Ajuda quando você só precisa dos números e quer evitar mapear objetos.
     */
    @Query("SELECT ou.id.unidadeId FROM OperadorUnidade ou WHERE ou.id.operadorId = :operadorId")
    List<Long> findUnidadeIds(@Param("operadorId") Long operadorId);
}
