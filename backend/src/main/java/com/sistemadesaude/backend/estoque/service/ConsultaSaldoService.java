package com.sistemadesaude.backend.estoque.service;

import com.sistemadesaude.backend.estoque.dto.SaldoPorLoteDTO;
import com.sistemadesaude.backend.estoque.entity.Lote;
import com.sistemadesaude.backend.estoque.mapper.EstoqueMapper;
import com.sistemadesaude.backend.estoque.repository.EstoqueLoteRepository;
import com.sistemadesaude.backend.estoque.repository.LoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConsultaSaldoService {
    private final EstoqueLoteRepository estoqueRepo;
    private final LoteRepository loteRepo;
    private final EstoqueMapper mapper;

    public List<SaldoPorLoteDTO> listarSaldosPorInsumo(Long localId, Long insumoId) {
        List<Lote> lotes = loteRepo.findByInsumoId(insumoId);
        return estoqueRepo.findByLocalIdAndLoteIn(localId, lotes)
                .stream().map(mapper::toSaldoDTO).toList();
    }

    /** Lista lotes vencidos/à vencer no local (tipo=CONFIGURACAO ou DATA, vide manual). */
    public List<SaldoPorLoteDTO> listarVencimentos(Long localId, LocalDate dataLimite) {
        return estoqueRepo.findByLocalIdAndLoteIn(localId, loteRepo.findAll())
                .stream()
                .filter(s -> s.getLote().getDataVencimento() != null
                        && s.getSaldo().signum() > 0)
                .map(mapper::toSaldoDTO)
                .filter(dto -> dto.getDataVencimento() != null && !dto.getDataVencimento().isAfter(dataLimite))
                .toList();

    }
}
