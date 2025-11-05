package com.sistemadesaude.backend.enfermagem.service;

import com.sistemadesaude.backend.enfermagem.dto.ProcedimentoEnfermagemDTO;
import com.sistemadesaude.backend.enfermagem.entity.AtendimentoEnfermagem;
import com.sistemadesaude.backend.enfermagem.entity.ProcedimentoEnfermagem;
import com.sistemadesaude.backend.enfermagem.entity.ProcedimentoEnfermagem.StatusProcedimento;
import com.sistemadesaude.backend.enfermagem.repository.AtendimentoEnfermagemRepository;
import com.sistemadesaude.backend.enfermagem.repository.ProcedimentoEnfermagemRepository;
import com.sistemadesaude.backend.exception.ResourceNotFoundException;
import com.sistemadesaude.backend.operador.entity.Operador;
import com.sistemadesaude.backend.operador.repository.OperadorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service para gerenciar Procedimentos de Enfermagem.
 * Implementa regras para procedimentos rápidos conforme manual UPA.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProcedimentoEnfermagemService {

    private final ProcedimentoEnfermagemRepository procedimentoRepository;
    private final AtendimentoEnfermagemRepository atendimentoRepository;
    private final OperadorRepository operadorRepository;

    /**
     * Cria novo procedimento de enfermagem.
     */
    @Transactional
    public ProcedimentoEnfermagemDTO criar(ProcedimentoEnfermagemDTO dto) {
        log.info("Criando procedimento tipo {} para atendimento ID: {}",
                dto.getTipoProcedimento(), dto.getAtendimentoId());

        // Validar atendimento existe
        AtendimentoEnfermagem atendimento = atendimentoRepository.findById(dto.getAtendimentoId())
                .orElseThrow(() -> new ResourceNotFoundException("Atendimento não encontrado"));

        // Validar executor se fornecido
        Operador executor = null;
        if (dto.getExecutorId() != null) {
            executor = operadorRepository.findById(dto.getExecutorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Executor não encontrado"));
        }

        // Criar entidade
        ProcedimentoEnfermagem procedimento = ProcedimentoEnfermagem.builder()
                .atendimento(atendimento)
                .tipoProcedimento(dto.getTipoProcedimento())
                .descricao(dto.getDescricao())
                .status(StatusProcedimento.PENDENTE)
                .executor(executor)
                // Medicação
                .medicamentoNome(dto.getMedicamentoNome())
                .medicamentoDose(dto.getMedicamentoDose())
                .medicamentoVia(dto.getMedicamentoVia())
                .medicamentoLote(dto.getMedicamentoLote())
                // Curativo
                .curativoLocalizacao(dto.getCurativoLocalizacao())
                .curativoTipo(dto.getCurativoTipo())
                .curativoMaterialUtilizado(dto.getCurativoMaterialUtilizado())
                .curativoAspecto(dto.getCurativoAspecto())
                // Sutura
                .suturaLocalizacao(dto.getSuturaLocalizacao())
                .suturaNumeroPontos(dto.getSuturaNumeroPontos())
                .suturaFioTipo(dto.getSuturaFioTipo())
                .suturaTecnica(dto.getSuturaTecnica())
                // Nebulização
                .nebulizacaoMedicamento(dto.getNebulizacaoMedicamento())
                .nebulizacaoDose(dto.getNebulizacaoDose())
                .nebulizacaoTempo(dto.getNebulizacaoTempo())
                // Oxigenioterapia
                .oxigenioFluxo(dto.getOxigenioFluxo())
                .oxigenioDispositivo(dto.getOxigenioDispositivo())
                // Sondagem
                .sondagemTipo(dto.getSondagemTipo())
                .sondagemNumero(dto.getSondagemNumero())
                .sondagemFixacao(dto.getSondagemFixacao())
                // Observações
                .observacoes(dto.getObservacoes())
                .complicacoes(dto.getComplicacoes())
                .build();

        procedimento = procedimentoRepository.save(procedimento);
        log.info("Procedimento criado com ID: {}", procedimento.getId());

        return converterParaDTO(procedimento);
    }

    /**
     * Busca procedimento por ID.
     */
    @Transactional(readOnly = true)
    public ProcedimentoEnfermagemDTO buscarPorId(Long id) {
        ProcedimentoEnfermagem procedimento = procedimentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Procedimento não encontrado"));
        return converterParaDTO(procedimento);
    }

    /**
     * Inicia execução de procedimento.
     */
    @Transactional
    public ProcedimentoEnfermagemDTO iniciarProcedimento(Long procedimentoId, Long executorId) {
        log.info("Iniciando procedimento ID: {} com executor ID: {}", procedimentoId, executorId);

        ProcedimentoEnfermagem procedimento = procedimentoRepository.findById(procedimentoId)
                .orElseThrow(() -> new ResourceNotFoundException("Procedimento não encontrado"));

        if (!procedimento.getStatus().equals(StatusProcedimento.PENDENTE)) {
            throw new IllegalStateException("Procedimento não está pendente. Status atual: " + procedimento.getStatus());
        }

        Operador executor = operadorRepository.findById(executorId)
                .orElseThrow(() -> new ResourceNotFoundException("Executor não encontrado"));

        procedimento.setExecutor(executor);
        procedimento.setStatus(StatusProcedimento.EM_EXECUCAO);
        procedimento.setDataHoraInicio(LocalDateTime.now());

        procedimento = procedimentoRepository.save(procedimento);
        log.info("Procedimento iniciado com sucesso");

        return converterParaDTO(procedimento);
    }

    /**
     * Finaliza procedimento.
     */
    @Transactional
    public ProcedimentoEnfermagemDTO finalizarProcedimento(Long procedimentoId, ProcedimentoEnfermagemDTO dto) {
        log.info("Finalizando procedimento ID: {}", procedimentoId);

        ProcedimentoEnfermagem procedimento = procedimentoRepository.findById(procedimentoId)
                .orElseThrow(() -> new ResourceNotFoundException("Procedimento não encontrado"));

        if (!procedimento.getStatus().equals(StatusProcedimento.EM_EXECUCAO)) {
            throw new IllegalStateException("Procedimento não está em execução. Status atual: " + procedimento.getStatus());
        }

        // Atualizar campos específicos se fornecidos
        if (dto.getMedicamentoDataAplicacao() != null) {
            procedimento.setMedicamentoDataAplicacao(dto.getMedicamentoDataAplicacao());
        }
        if (dto.getObservacoes() != null) {
            procedimento.setObservacoes(dto.getObservacoes());
        }
        if (dto.getComplicacoes() != null) {
            procedimento.setComplicacoes(dto.getComplicacoes());
        }

        procedimento.setStatus(StatusProcedimento.CONCLUIDO);
        procedimento.setDataHoraFim(LocalDateTime.now());

        procedimento = procedimentoRepository.save(procedimento);
        log.info("Procedimento finalizado com sucesso");

        return converterParaDTO(procedimento);
    }

    /**
     * Cancela procedimento.
     */
    @Transactional
    public ProcedimentoEnfermagemDTO cancelarProcedimento(Long procedimentoId, String motivo) {
        log.info("Cancelando procedimento ID: {} - Motivo: {}", procedimentoId, motivo);

        ProcedimentoEnfermagem procedimento = procedimentoRepository.findById(procedimentoId)
                .orElseThrow(() -> new ResourceNotFoundException("Procedimento não encontrado"));

        if (procedimento.getStatus().equals(StatusProcedimento.CONCLUIDO)) {
            throw new IllegalStateException("Não é possível cancelar procedimento concluído");
        }

        procedimento.setStatus(StatusProcedimento.CANCELADO);
        procedimento.setObservacoes(
            (procedimento.getObservacoes() != null ? procedimento.getObservacoes() + "\n" : "") +
            "CANCELADO: " + motivo
        );

        procedimento = procedimentoRepository.save(procedimento);
        return converterParaDTO(procedimento);
    }

    /**
     * Lista procedimentos por atendimento.
     */
    @Transactional(readOnly = true)
    public List<ProcedimentoEnfermagemDTO> listarPorAtendimento(Long atendimentoId) {
        List<ProcedimentoEnfermagem> procedimentos = procedimentoRepository.findProcedimentosPorAtendimento(atendimentoId);
        return procedimentos.stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lista procedimentos por atendimento e status.
     */
    @Transactional(readOnly = true)
    public List<ProcedimentoEnfermagemDTO> listarPorAtendimentoEStatus(Long atendimentoId, StatusProcedimento status) {
        List<ProcedimentoEnfermagem> procedimentos = procedimentoRepository.findByAtendimentoIdAndStatus(atendimentoId, status);
        return procedimentos.stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    /**
     * Atualiza procedimento (campos específicos).
     */
    @Transactional
    public ProcedimentoEnfermagemDTO atualizar(Long procedimentoId, ProcedimentoEnfermagemDTO dto) {
        log.info("Atualizando procedimento ID: {}", procedimentoId);

        ProcedimentoEnfermagem procedimento = procedimentoRepository.findById(procedimentoId)
                .orElseThrow(() -> new ResourceNotFoundException("Procedimento não encontrado"));

        // Atualizar campos permitidos
        if (dto.getDescricao() != null) procedimento.setDescricao(dto.getDescricao());
        if (dto.getObservacoes() != null) procedimento.setObservacoes(dto.getObservacoes());
        if (dto.getComplicacoes() != null) procedimento.setComplicacoes(dto.getComplicacoes());

        // Campos específicos
        if (dto.getMedicamentoNome() != null) procedimento.setMedicamentoNome(dto.getMedicamentoNome());
        if (dto.getMedicamentoDose() != null) procedimento.setMedicamentoDose(dto.getMedicamentoDose());
        if (dto.getMedicamentoVia() != null) procedimento.setMedicamentoVia(dto.getMedicamentoVia());
        if (dto.getMedicamentoLote() != null) procedimento.setMedicamentoLote(dto.getMedicamentoLote());

        if (dto.getCurativoLocalizacao() != null) procedimento.setCurativoLocalizacao(dto.getCurativoLocalizacao());
        if (dto.getCurativoTipo() != null) procedimento.setCurativoTipo(dto.getCurativoTipo());
        if (dto.getCurativoAspecto() != null) procedimento.setCurativoAspecto(dto.getCurativoAspecto());

        procedimento = procedimentoRepository.save(procedimento);
        log.info("Procedimento atualizado com sucesso");

        return converterParaDTO(procedimento);
    }

    /**
     * Converte entidade para DTO.
     */
    private ProcedimentoEnfermagemDTO converterParaDTO(ProcedimentoEnfermagem procedimento) {
        return ProcedimentoEnfermagemDTO.builder()
                .id(procedimento.getId())
                .atendimentoId(procedimento.getAtendimento().getId())
                .tipoProcedimento(procedimento.getTipoProcedimento())
                .descricao(procedimento.getDescricao())
                .status(procedimento.getStatus())
                // Medicação
                .medicamentoNome(procedimento.getMedicamentoNome())
                .medicamentoDose(procedimento.getMedicamentoDose())
                .medicamentoVia(procedimento.getMedicamentoVia())
                .medicamentoLote(procedimento.getMedicamentoLote())
                .medicamentoDataAplicacao(procedimento.getMedicamentoDataAplicacao())
                // Curativo
                .curativoLocalizacao(procedimento.getCurativoLocalizacao())
                .curativoTipo(procedimento.getCurativoTipo())
                .curativoMaterialUtilizado(procedimento.getCurativoMaterialUtilizado())
                .curativoAspecto(procedimento.getCurativoAspecto())
                // Sutura
                .suturaLocalizacao(procedimento.getSuturaLocalizacao())
                .suturaNumeroPontos(procedimento.getSuturaNumeroPontos())
                .suturaFioTipo(procedimento.getSuturaFioTipo())
                .suturaTecnica(procedimento.getSuturaTecnica())
                // Nebulização
                .nebulizacaoMedicamento(procedimento.getNebulizacaoMedicamento())
                .nebulizacaoDose(procedimento.getNebulizacaoDose())
                .nebulizacaoTempo(procedimento.getNebulizacaoTempo())
                // Oxigenioterapia
                .oxigenioFluxo(procedimento.getOxigenioFluxo())
                .oxigenioDispositivo(procedimento.getOxigenioDispositivo())
                // Sondagem
                .sondagemTipo(procedimento.getSondagemTipo())
                .sondagemNumero(procedimento.getSondagemNumero())
                .sondagemFixacao(procedimento.getSondagemFixacao())
                // Campos gerais
                .observacoes(procedimento.getObservacoes())
                .complicacoes(procedimento.getComplicacoes())
                .executorId(procedimento.getExecutor() != null ? procedimento.getExecutor().getId() : null)
                .executorNome(procedimento.getExecutor() != null ? procedimento.getExecutor().getNome() : null)
                .dataHoraInicio(procedimento.getDataHoraInicio())
                .dataHoraFim(procedimento.getDataHoraFim())
                .criadoEm(procedimento.getCriadoEm())
                .atualizadoEm(procedimento.getAtualizadoEm())
                .criadoPor(procedimento.getCriadoPor())
                .atualizadoPor(procedimento.getAtualizadoPor())
                .build();
    }
}
