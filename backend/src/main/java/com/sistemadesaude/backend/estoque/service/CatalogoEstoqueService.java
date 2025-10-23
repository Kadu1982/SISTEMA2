package com.sistemadesaude.backend.estoque.service;

import com.sistemadesaude.backend.estoque.dto.CentroCustoDTO;
import com.sistemadesaude.backend.estoque.dto.InsumoDTO;
import com.sistemadesaude.backend.estoque.dto.LocalArmazenamentoDTO;
import com.sistemadesaude.backend.estoque.entity.Fabricante;
import com.sistemadesaude.backend.estoque.entity.LocalArmazenamento;
import com.sistemadesaude.backend.estoque.entity.Operacao;
import com.sistemadesaude.backend.estoque.enums.TipoOperacao;
import com.sistemadesaude.backend.estoque.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CatalogoEstoqueService {

    /**
     * Camada de serviço para catálogos (listas de apoio) do módulo de Estoque.
     * Mantém separação das operações transacionais (Entradas/Saídas/Transferências) e
     * centraliza as leituras simples usadas pelo frontend (combos, tabelas, etc.).
     */
    private final LocalArmazenamentoRepository localRepo;
    private final InsumoRepository insumoRepo;
    private final FabricanteRepository fabricanteRepo;
    private final OperacaoRepository operacaoRepo;

    // ---------------------- Locais / Centros de Custo ----------------------

    public List<LocalArmazenamentoDTO> listarLocais() {
        return localRepo.findAll()
                .stream()
                .map(this::toLocalDTO)
                .toList();
    }

    public List<CentroCustoDTO> listarCentrosCusto() {
        return localRepo.findAll()
                .stream()
                .map(this::toCentroCustoDTO)
                .toList();
    }

    private LocalArmazenamentoDTO toLocalDTO(LocalArmazenamento e) {
        return LocalArmazenamentoDTO.builder()
                .id(e.getId())
                .nome(e.getNome())
                .unidadeSaudeId(e.getUnidadeSaude() != null ? e.getUnidadeSaude().getId() : null)
                .politicaCodigoSequencial(e.getPoliticaCodigoSequencial())
                .geracaoEntradaTransferencia(e.getGeracaoEntradaTransferencia())
                .usaCodigoBarrasPorLote(e.isUsaCodigoBarrasPorLote())
                .ativo(e.isAtivo())
                .build();
    }

    private CentroCustoDTO toCentroCustoDTO(LocalArmazenamento e) {
        return CentroCustoDTO.builder()
                .id(e.getId())
                .nome(e.getNome())
                .unidadeSaudeId(e.getUnidadeSaude() != null ? e.getUnidadeSaude().getId() : null)
                .politicaCodigoSequencial(e.getPoliticaCodigoSequencial())
                .geracaoEntradaTransferencia(e.getGeracaoEntradaTransferencia())
                .usaCodigoBarrasPorLote(e.isUsaCodigoBarrasPorLote())
                .ativo(e.isAtivo())
                .build();
    }

    // ---------------------- Insumos / Fabricantes ----------------------

    public List<InsumoDTO> listarInsumos() {
        return insumoRepo.findAll()
                .stream()
                .map(e -> InsumoDTO.builder()
                        .id(e.getId())
                        .descricao(e.getDescricao())
                        .apresentacao(e.getApresentacao())
                        .dosagem(e.getDosagem())
                        .descricaoCompleta(e.getDescricaoCompleta())
                        .unidadeMedida(e.getUnidadeMedida())
                        .controleEstoque(e.getControleEstoque())
                        .diasAlertaVencimento(e.getDiasAlertaVencimento())
                        .codigoBarrasPadrao(e.getCodigoBarrasPadrao())
                        .ativo(e.getAtivo())
                        .build())
                .toList();
    }

    public List<Fabricante> listarFabricantes() {

        return fabricanteRepo.findAll();
    }

    // ---------------------- Operações ----------------------

    public List<Operacao> listarOperacoes(TipoOperacao tipo) {
        if (tipo == null) {
            return operacaoRepo.findAll();
        }
        // Filtro simples em memória; se necessário, substitua por query específica no repositório.
        return operacaoRepo.findAll()
                .stream()
                .filter(op -> tipo.equals(op.getTipo()))
                .toList();
    }
}
