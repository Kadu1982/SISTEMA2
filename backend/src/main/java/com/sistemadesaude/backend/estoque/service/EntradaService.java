package com.sistemadesaude.backend.estoque.service;

import com.sistemadesaude.backend.estoque.dto.EntradaDTO;
import com.sistemadesaude.backend.estoque.entity.*;
import com.sistemadesaude.backend.estoque.enums.TipoControleEstoque;
import com.sistemadesaude.backend.estoque.repository.*;
import com.sistemadesaude.backend.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class EntradaService {

    private final LocalArmazenamentoRepository localRepo;
    private final OperacaoRepository operacaoRepo;
    private final InsumoRepository insumoRepo;
    private final FabricanteRepository fabricanteRepo;
    private final LoteRepository loteRepo;
    private final EntradaRepository entradaRepo;
    private final EstoqueMovimentoService movService;

    /** Cria entrada com itens e credita saldos por lote. */
    @Transactional
    public ApiResponse<Long> criar(EntradaDTO dto) {
        LocalArmazenamento local = localRepo.findById(dto.getLocalId())
                .orElseThrow(() -> new IllegalArgumentException("Local não encontrado."));
        Operacao operacao = operacaoRepo.findById(dto.getOperacaoId())
                .orElseThrow(() -> new IllegalArgumentException("Operação não encontrada."));

        Entrada entrada = Entrada.builder()
                .local(local).operacao(operacao)
                .dataHora(LocalDateTime.now())
                .observacao(dto.getObservacao())
                .build();

        dto.getItens().forEach(it -> {
            Insumo insumo = insumoRepo.findById(it.getInsumoId())
                    .orElseThrow(() -> new IllegalArgumentException("Insumo não encontrado."));
            // cria/pega LOTE conforme controle do insumo
            Lote lote = obterOuCriarLotePelaEntrada(insumo, it);
            EntradaItem item = EntradaItem.builder()
                    .entrada(entrada)
                    .lote(lote)
                    .quantidade(it.getQuantidade())
                    .valorUnitario(it.getValorUnitario())
                    .localizacaoFisica(it.getLocalizacaoFisica())
                    .build();
            entrada.getItens().add(item);
            movService.creditar(local, lote, it.getQuantidade());
        });

        Entrada salvo = entradaRepo.save(entrada);
        return new ApiResponse<>(true, "Entrada registrada com sucesso.", salvo.getId());
    }

    private Lote obterOuCriarLotePelaEntrada(Insumo insumo, EntradaDTO.Item it) {
        // Se controle = LOTE, é obrigatório informar lote do fabricante e (opcionalmente) fabricante/código de barras
        if (insumo.getControleEstoque() == TipoControleEstoque.LOTE) {
            Long fabId = it.getFabricanteId();
            Fabricante fab = fabId != null ? fabricanteRepo.findById(fabId).orElse(null) : null;
            return loteRepo.findByInsumoIdAndFabricanteIdAndLoteFabricante(
                            insumo.getId(), fabId, it.getLoteFabricante())
                    .orElseGet(() -> loteRepo.save(Lote.builder()
                            .insumo(insumo)
                            .fabricante(fab)
                            .loteFabricante(it.getLoteFabricante())
                            .codigoBarras(it.getCodigoBarras())
                            .dataVencimento(it.getDataVencimento())
                            .localizacaoFisica(it.getLocalizacaoFisica())
                            .build()));
        }
        // Para QUANTIDADE/VENCIMENTO criamos um "pseudo-lote" por data/descrição (prático p/ MVP)
        return loteRepo.save(Lote.builder()
                .insumo(insumo)
                .loteFabricante(it.getLoteFabricante() != null ? it.getLoteFabricante() : "SEM_LOTE")
                .codigoBarras(it.getCodigoBarras())
                .dataVencimento(it.getDataVencimento())
                .localizacaoFisica(it.getLocalizacaoFisica())
                .build());
    }
}
