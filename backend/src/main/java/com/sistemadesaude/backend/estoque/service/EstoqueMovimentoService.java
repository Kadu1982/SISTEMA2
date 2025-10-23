package com.sistemadesaude.backend.estoque.service;

import com.sistemadesaude.backend.estoque.entity.*;
import com.sistemadesaude.backend.estoque.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class EstoqueMovimentoService {

    private final EstoqueLoteRepository estoqueLoteRepository;

    /** Credita quantidade no saldo do LOTE em um LOCAL. */
    @Transactional
    public EstoqueLote creditar(LocalArmazenamento local, Lote lote, BigDecimal qtd) {
        EstoqueLote el = estoqueLoteRepository
                .findByLocalIdAndLoteId(local.getId(), lote.getId())
                .orElse(EstoqueLote.builder().local(local).lote(lote).saldo(BigDecimal.ZERO).build());

        el.setSaldo(el.getSaldo().add(qtd));
        return estoqueLoteRepository.save(el);
    }

    /** Debita quantidade do saldo do LOTE em um LOCAL, validando saldo não negativo. */
    @Transactional
    public EstoqueLote debitar(LocalArmazenamento local, Lote lote, BigDecimal qtd) {
        EstoqueLote el = estoqueLoteRepository
                .findByLocalIdAndLoteId(local.getId(), lote.getId())
                .orElseThrow(() -> new IllegalArgumentException("Saldo inexistente para o lote no local."));
        if (el.getSaldo().compareTo(qtd) < 0) {
            throw new IllegalArgumentException("Saldo insuficiente para o lote no local.");
        }
        el.setSaldo(el.getSaldo().subtract(qtd));
        return estoqueLoteRepository.save(el);
    }
}
