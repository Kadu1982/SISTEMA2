package com.sistemadesaude.backend.estoque.mapper;

import com.sistemadesaude.backend.estoque.dto.*;
import com.sistemadesaude.backend.estoque.entity.*;
import org.springframework.stereotype.Component;

@Component
public class EstoqueMapper {

    public SaldoPorLoteDTO toSaldoDTO(EstoqueLote el) {
        Lote l = el.getLote();
        return SaldoPorLoteDTO.builder()
                .loteId(l.getId())
                .insumoId(l.getInsumo().getId())
                .insumoDescricao(l.getInsumo().getDescricao())
                .loteFabricante(l.getLoteFabricante())
                .codigoBarras(l.getCodigoBarras())
                .dataVencimento(l.getDataVencimento())
                .saldo(el.getSaldo())
                .build();
    }
}
