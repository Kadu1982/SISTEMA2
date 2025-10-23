package com.sistemadesaude.backend.estoque.service;

import com.sistemadesaude.backend.estoque.entity.LocalArmazenamento;
import com.sistemadesaude.backend.estoque.entity.Lote;

import java.math.BigDecimal;

/**
 * Serviço de movimentação de estoque (adapter).
 * Mantém a assinatura usada pelo SaidaService: debitar(local, lote, quantidade).
 * Se você já possui um serviço equivalente com outro nome/método,
 * basta implementar esta interface delegando para ele.
 */
public interface MovimentacaoEstoqueService {

    /**
     * Debita a quantidade informada do estoque do Lote no Local.
     * Implementação padrão atualiza a quantidade do Lote de forma segura.
     */
    void debitar(LocalArmazenamento local, Lote lote, BigDecimal quantidade);
}
