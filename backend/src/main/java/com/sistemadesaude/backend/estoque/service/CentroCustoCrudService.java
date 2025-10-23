package com.sistemadesaude.backend.estoque.service;

import com.sistemadesaude.backend.estoque.dto.CentroCustoDTO;
import com.sistemadesaude.backend.estoque.dto.CentroCustoRequest;
import com.sistemadesaude.backend.estoque.entity.LocalArmazenamento;
import com.sistemadesaude.backend.estoque.enums.GeracaoEntradaTransferencia;
import com.sistemadesaude.backend.estoque.enums.PoliticaCodigoSequencial;
import com.sistemadesaude.backend.estoque.repository.LocalArmazenamentoRepository;

// ATENÇÃO: o pacote correto na sua base é "unidadesaude"
import com.sistemadesaude.backend.unidadesaude.entity.UnidadeSaude;
import com.sistemadesaude.backend.unidadesaude.repository.UnidadeSaudeRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;

import static org.springframework.http.HttpStatus.*;

/**
 * CRUD de Centros de Custo (alias de LocalArmazenamento)
 * - Compatível com variações de nomes das constantes enum (NAO/NAO_GERAR/NONE) via resolveEnum(...)
 * - Não depende de método custom no repository; faz checagem genérica de duplicidade.
 */
@Service
@RequiredArgsConstructor
public class CentroCustoCrudService {

    private final LocalArmazenamentoRepository localRepo;
    private final UnidadeSaudeRepository unidadeSaudeRepository; // bean existente no pacote "unidadesaude"

    // ===== Helper: resolve constantes de enum mesmo que o nome varie (NAO, NAO_GERAR, NONE, etc.) =====
    private static <E extends Enum<E>> E resolveEnum(Class<E> clazz, String... candidates) {
        for (String name : candidates) {
            try {
                return Enum.valueOf(clazz, name);
            } catch (IllegalArgumentException ignored) { /* tenta o próximo */ }
        }
        // fallback: primeiro valor do enum (evita null)
        return clazz.getEnumConstants()[0];
    }

    private static final PoliticaCodigoSequencial DEFAULT_POLITICA =
            resolveEnum(PoliticaCodigoSequencial.class, "NAO", "NAO_APLICA", "NONE");

    private static final GeracaoEntradaTransferencia DEFAULT_GERACAO =
            resolveEnum(GeracaoEntradaTransferencia.class, "NAO", "NAO_GERAR", "NONE");

    // ---------------------- Mappers ----------------------
    private CentroCustoDTO toDTO(LocalArmazenamento e) {
        Long unidadeId = e.getUnidadeSaude() != null ? e.getUnidadeSaude().getId() : null;
        return CentroCustoDTO.builder()
                .id(e.getId())
                .nome(e.getNome())
                .unidadeSaudeId(unidadeId)
                .politicaCodigoSequencial(e.getPoliticaCodigoSequencial())
                .geracaoEntradaTransferencia(e.getGeracaoEntradaTransferencia())
                .usaCodigoBarrasPorLote(e.isUsaCodigoBarrasPorLote())
                .ativo(e.isAtivo())
                .build();
    }

    /** Aplica os campos do request na entidade. PUT substitui; PATCH altera apenas o que vier. */
    private void applyRequest(LocalArmazenamento e, CentroCustoRequest r, boolean isPut) {
        // Nome
        if (isPut || r.getNome() != null) {
            String nome = r.getNome();
            if (!StringUtils.hasText(nome)) {
                throw new ResponseStatusException(BAD_REQUEST, "Nome do Centro de Custo é obrigatório");
            }
            e.setNome(nome.trim());
        }

        // Unidade de Saúde (resolve por ID usando o repositório correto)
        if (isPut || r.getUnidadeSaudeId() != null) {
            UnidadeSaude unidade = null;
            if (r.getUnidadeSaudeId() != null) {
                unidade = unidadeSaudeRepository.findById(r.getUnidadeSaudeId())
                        .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Unidade de Saúde não encontrada"));
            }
            e.setUnidadeSaude(unidade);
        }

        // Política de Código Sequencial
        if (isPut || r.getPoliticaCodigoSequencial() != null) {
            e.setPoliticaCodigoSequencial(
                    Objects.requireNonNullElse(r.getPoliticaCodigoSequencial(), DEFAULT_POLITICA)
            );
        }

        // Geração de Entrada por Transferência
        if (isPut || r.getGeracaoEntradaTransferencia() != null) {
            e.setGeracaoEntradaTransferencia(
                    Objects.requireNonNullElse(r.getGeracaoEntradaTransferencia(), DEFAULT_GERACAO)
            );
        }

        // Código por Lote
        if (isPut || r.getUsaCodigoBarrasPorLote() != null) {
            e.setUsaCodigoBarrasPorLote(Boolean.TRUE.equals(r.getUsaCodigoBarrasPorLote()));
        }

        // Ativo
        if (isPut || r.getAtivo() != null) {
            e.setAtivo(r.getAtivo() == null || r.getAtivo()); // default true
        }
    }

    // ---------------------- Regras/CRUD ----------------------
    public List<CentroCustoDTO> listar() {
        return localRepo.findAll().stream().map(this::toDTO).toList();
    }

    public CentroCustoDTO obter(Long id) {
        var e = localRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Centro de Custo não encontrado"));
        return toDTO(e);
    }

    public CentroCustoDTO criar(CentroCustoRequest r) {
        if (!StringUtils.hasText(r.getNome())) {
            throw new ResponseStatusException(BAD_REQUEST, "Nome do Centro de Custo é obrigatório");
        }

        // Checagem genérica de duplicidade (nome + unidade) sem depender de método custom do repository
        boolean jaExiste = localRepo.findAll().stream().anyMatch(l -> {
            String nomeExistente = l.getNome() != null ? l.getNome().trim().toLowerCase() : null;
            String nomeReq = r.getNome().trim().toLowerCase();
            Long unidadeExistente = l.getUnidadeSaude() != null ? l.getUnidadeSaude().getId() : null;
            return Objects.equals(nomeExistente, nomeReq) && Objects.equals(unidadeExistente, r.getUnidadeSaudeId());
        });
        if (jaExiste) {
            throw new ResponseStatusException(CONFLICT, "Já existe Centro de Custo com esse nome na unidade");
        }

        var entity = new LocalArmazenamento();
        // Defaults seguros (sem depender do nome exato das constantes do enum):
        entity.setPoliticaCodigoSequencial(DEFAULT_POLITICA);
        entity.setGeracaoEntradaTransferencia(DEFAULT_GERACAO);
        entity.setUsaCodigoBarrasPorLote(false);
        entity.setAtivo(true);

        applyRequest(entity, r, false);
        return toDTO(localRepo.save(entity));
    }

    public CentroCustoDTO putAtualizar(Long id, CentroCustoRequest r) {
        var entity = localRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Centro de Custo não encontrado"));
        applyRequest(entity, r, true);
        return toDTO(localRepo.save(entity));
    }

    public CentroCustoDTO patchAtualizar(Long id, CentroCustoRequest r) {
        var entity = localRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Centro de Custo não encontrado"));
        applyRequest(entity, r, false);
        return toDTO(localRepo.save(entity));
    }
}
