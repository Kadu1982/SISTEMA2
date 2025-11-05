package com.sistemadesaude.backend.enfermagem.service;

import com.sistemadesaude.backend.enfermagem.dto.AtendimentoEnfermagemDTO;
import com.sistemadesaude.backend.enfermagem.dto.ProcedimentoEnfermagemDTO;
import com.sistemadesaude.backend.enfermagem.entity.AtendimentoEnfermagem;
import com.sistemadesaude.backend.enfermagem.entity.AtendimentoEnfermagem.OrigemAtendimento;
import com.sistemadesaude.backend.enfermagem.entity.AtendimentoEnfermagem.Prioridade;
import com.sistemadesaude.backend.enfermagem.entity.AtendimentoEnfermagem.StatusAtendimento;
import com.sistemadesaude.backend.enfermagem.entity.ProcedimentoEnfermagem;
import com.sistemadesaude.backend.enfermagem.repository.AtendimentoEnfermagemRepository;
import com.sistemadesaude.backend.enfermagem.repository.ProcedimentoEnfermagemRepository;
import com.sistemadesaude.backend.exception.ResourceNotFoundException;
import com.sistemadesaude.backend.operador.entity.Operador;
import com.sistemadesaude.backend.operador.repository.OperadorRepository;
import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.paciente.repository.PacienteRepository;
import com.sistemadesaude.backend.unidadesaude.entity.UnidadeSaude;
import com.sistemadesaude.backend.unidadesaude.repository.UnidadeSaudeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service para gerenciar Atendimentos de Enfermagem.
 * Implementa regras de negócio para procedimentos rápidos conforme manual UPA.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AtendimentoEnfermagemService {

    private final AtendimentoEnfermagemRepository atendimentoRepository;
    private final ProcedimentoEnfermagemRepository procedimentoRepository;
    private final PacienteRepository pacienteRepository;
    private final UnidadeSaudeRepository unidadeRepository;
    private final OperadorRepository operadorRepository;

    /**
     * Cria novo atendimento de enfermagem a partir do Ambulatorial ou UPA.
     */
    @Transactional
    public AtendimentoEnfermagemDTO criar(AtendimentoEnfermagemDTO dto) {
        log.info("Criando atendimento de enfermagem para paciente ID: {}", dto.getPacienteId());

        // Validar existência de entidades relacionadas
        Paciente paciente = pacienteRepository.findById(dto.getPacienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado"));

        UnidadeSaude unidade = unidadeRepository.findById(dto.getUnidadeId())
                .orElseThrow(() -> new ResourceNotFoundException("Unidade de saúde não encontrada"));

        // Criar entidade
        AtendimentoEnfermagem atendimento = AtendimentoEnfermagem.builder()
                .paciente(paciente)
                .unidade(unidade)
                .origemAtendimento(dto.getOrigemAtendimento())
                .origemId(dto.getOrigemId())
                .prioridade(dto.getPrioridade() != null ? dto.getPrioridade() : Prioridade.ROTINA)
                .status(StatusAtendimento.AGUARDANDO)
                .queixaPrincipal(dto.getQueixaPrincipal())
                .observacoes(dto.getObservacoes())
                .dataHoraInicio(LocalDateTime.now())
                .build();

        atendimento = atendimentoRepository.save(atendimento);
        log.info("Atendimento de enfermagem criado com ID: {}", atendimento.getId());

        return converterParaDTO(atendimento);
    }

    /**
     * Busca atendimento por ID.
     */
    @Transactional(readOnly = true)
    public AtendimentoEnfermagemDTO buscarPorId(Long id) {
        AtendimentoEnfermagem atendimento = atendimentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Atendimento não encontrado"));
        return converterParaDTO(atendimento);
    }

    /**
     * Inicia atendimento atribuindo enfermeiro.
     */
    @Transactional
    public AtendimentoEnfermagemDTO iniciarAtendimento(Long atendimentoId, Long enfermeiroId) {
        log.info("Iniciando atendimento ID: {} com enfermeiro ID: {}", atendimentoId, enfermeiroId);

        AtendimentoEnfermagem atendimento = atendimentoRepository.findById(atendimentoId)
                .orElseThrow(() -> new ResourceNotFoundException("Atendimento não encontrado"));

        if (!atendimento.getStatus().equals(StatusAtendimento.AGUARDANDO)) {
            throw new IllegalStateException("Atendimento não está aguardando. Status atual: " + atendimento.getStatus());
        }

        Operador enfermeiro = operadorRepository.findById(enfermeiroId)
                .orElseThrow(() -> new ResourceNotFoundException("Enfermeiro não encontrado"));

        atendimento.setEnfermeiro(enfermeiro);
        atendimento.setStatus(StatusAtendimento.EM_ATENDIMENTO);
        atendimento.setDataHoraInicio(LocalDateTime.now());

        atendimento = atendimentoRepository.save(atendimento);
        log.info("Atendimento iniciado com sucesso");

        return converterParaDTO(atendimento);
    }

    /**
     * Registra sinais vitais no atendimento.
     */
    @Transactional
    public AtendimentoEnfermagemDTO registrarSinaisVitais(Long atendimentoId, AtendimentoEnfermagemDTO dto) {
        log.info("Registrando sinais vitais para atendimento ID: {}", atendimentoId);

        AtendimentoEnfermagem atendimento = atendimentoRepository.findById(atendimentoId)
                .orElseThrow(() -> new ResourceNotFoundException("Atendimento não encontrado"));

        atendimento.setPressaoArterial(dto.getPressaoArterial());
        atendimento.setFrequenciaCardiaca(dto.getFrequenciaCardiaca());
        atendimento.setFrequenciaRespiratoria(dto.getFrequenciaRespiratoria());
        atendimento.setTemperatura(dto.getTemperatura());
        atendimento.setSaturacaoO2(dto.getSaturacaoO2());
        atendimento.setGlicemia(dto.getGlicemia());
        atendimento.setEscalaDor(dto.getEscalaDor());
        atendimento.setCondicoesGerais(dto.getCondicoesGerais());

        atendimento = atendimentoRepository.save(atendimento);
        log.info("Sinais vitais registrados com sucesso");

        return converterParaDTO(atendimento);
    }

    /**
     * Finaliza atendimento.
     */
    @Transactional
    public AtendimentoEnfermagemDTO finalizarAtendimento(Long atendimentoId, String observacoesFinais) {
        log.info("Finalizando atendimento ID: {}", atendimentoId);

        AtendimentoEnfermagem atendimento = atendimentoRepository.findById(atendimentoId)
                .orElseThrow(() -> new ResourceNotFoundException("Atendimento não encontrado"));

        if (!atendimento.getStatus().equals(StatusAtendimento.EM_ATENDIMENTO)) {
            throw new IllegalStateException("Atendimento não está em andamento. Status atual: " + atendimento.getStatus());
        }

        atendimento.setStatus(StatusAtendimento.FINALIZADO);
        atendimento.setDataHoraFim(LocalDateTime.now());
        if (observacoesFinais != null) {
            atendimento.setObservacoes(
                (atendimento.getObservacoes() != null ? atendimento.getObservacoes() + "\n" : "") + observacoesFinais
            );
        }

        atendimento = atendimentoRepository.save(atendimento);
        log.info("Atendimento finalizado com sucesso");

        return converterParaDTO(atendimento);
    }

    /**
     * Cancela atendimento.
     */
    @Transactional
    public AtendimentoEnfermagemDTO cancelarAtendimento(Long atendimentoId, String motivo) {
        log.info("Cancelando atendimento ID: {} - Motivo: {}", atendimentoId, motivo);

        AtendimentoEnfermagem atendimento = atendimentoRepository.findById(atendimentoId)
                .orElseThrow(() -> new ResourceNotFoundException("Atendimento não encontrado"));

        if (atendimento.getStatus().equals(StatusAtendimento.FINALIZADO)) {
            throw new IllegalStateException("Não é possível cancelar atendimento finalizado");
        }

        atendimento.setStatus(StatusAtendimento.CANCELADO);
        atendimento.setObservacoes(
            (atendimento.getObservacoes() != null ? atendimento.getObservacoes() + "\n" : "") +
            "CANCELADO: " + motivo
        );

        atendimento = atendimentoRepository.save(atendimento);
        return converterParaDTO(atendimento);
    }

    /**
     * Lista fila de atendimentos por unidade (aguardando e em atendimento).
     */
    @Transactional(readOnly = true)
    public List<AtendimentoEnfermagemDTO> listarFilaAtendimento(Long unidadeId) {
        List<StatusAtendimento> statuses = List.of(StatusAtendimento.AGUARDANDO, StatusAtendimento.EM_ATENDIMENTO);
        List<AtendimentoEnfermagem> atendimentos = atendimentoRepository.findFilaAtendimento(unidadeId, statuses);
        return atendimentos.stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lista atendimentos por unidade e status com paginação.
     */
    @Transactional(readOnly = true)
    public Page<AtendimentoEnfermagemDTO> listarPorUnidadeEStatus(Long unidadeId, StatusAtendimento status, Pageable pageable) {
        Page<AtendimentoEnfermagem> page = atendimentoRepository.findByUnidadeIdAndStatus(unidadeId, status, pageable);
        return page.map(this::converterParaDTO);
    }

    /**
     * Lista todos os atendimentos de uma unidade.
     */
    @Transactional(readOnly = true)
    public Page<AtendimentoEnfermagemDTO> listarPorUnidade(Long unidadeId, Pageable pageable) {
        Page<AtendimentoEnfermagem> page = atendimentoRepository.findByUnidadeId(unidadeId, pageable);
        return page.map(this::converterParaDTO);
    }

    /**
     * Lista atendimentos por paciente.
     */
    @Transactional(readOnly = true)
    public Page<AtendimentoEnfermagemDTO> listarPorPaciente(Long pacienteId, Pageable pageable) {
        Page<AtendimentoEnfermagem> page = atendimentoRepository.findByPacienteId(pacienteId, pageable);
        return page.map(this::converterParaDTO);
    }

    /**
     * Conta atendimentos por unidade e status.
     */
    @Transactional(readOnly = true)
    public Long contarPorUnidadeEStatus(Long unidadeId, StatusAtendimento status) {
        return atendimentoRepository.countByUnidadeAndStatus(unidadeId, status);
    }

    /**
     * Converte entidade para DTO.
     */
    private AtendimentoEnfermagemDTO converterParaDTO(AtendimentoEnfermagem atendimento) {
        // Buscar procedimentos associados
        List<ProcedimentoEnfermagem> procedimentos = procedimentoRepository.findByAtendimentoId(atendimento.getId());
        List<ProcedimentoEnfermagemDTO> procedimentosDTO = procedimentos.stream()
                .map(this::converterProcedimentoParaDTO)
                .collect(Collectors.toList());

        return AtendimentoEnfermagemDTO.builder()
                .id(atendimento.getId())
                .pacienteId(atendimento.getPaciente().getId())
                .pacienteNome(atendimento.getPaciente().getNome())
                .pacienteCpf(atendimento.getPaciente().getCpf())
                .unidadeId(atendimento.getUnidade().getId())
                .unidadeNome(atendimento.getUnidade().getNome())
                .enfermeiroId(atendimento.getEnfermeiro() != null ? atendimento.getEnfermeiro().getId() : null)
                .enfermeiroNome(atendimento.getEnfermeiro() != null ? atendimento.getEnfermeiro().getNome() : null)
                .origemAtendimento(atendimento.getOrigemAtendimento())
                .origemId(atendimento.getOrigemId())
                .prioridade(atendimento.getPrioridade())
                .status(atendimento.getStatus())
                .pressaoArterial(atendimento.getPressaoArterial())
                .frequenciaCardiaca(atendimento.getFrequenciaCardiaca())
                .frequenciaRespiratoria(atendimento.getFrequenciaRespiratoria())
                .temperatura(atendimento.getTemperatura())
                .saturacaoO2(atendimento.getSaturacaoO2())
                .glicemia(atendimento.getGlicemia())
                .escalaDor(atendimento.getEscalaDor())
                .queixaPrincipal(atendimento.getQueixaPrincipal())
                .observacoes(atendimento.getObservacoes())
                .condicoesGerais(atendimento.getCondicoesGerais())
                .dataHoraInicio(atendimento.getDataHoraInicio())
                .dataHoraFim(atendimento.getDataHoraFim())
                .procedimentos(procedimentosDTO)
                .criadoEm(atendimento.getCriadoEm())
                .atualizadoEm(atendimento.getAtualizadoEm())
                .criadoPor(atendimento.getCriadoPor())
                .atualizadoPor(atendimento.getAtualizadoPor())
                .build();
    }

    /**
     * Converte procedimento para DTO (usado apenas para incluir na lista do atendimento).
     */
    private ProcedimentoEnfermagemDTO converterProcedimentoParaDTO(ProcedimentoEnfermagem proc) {
        return ProcedimentoEnfermagemDTO.builder()
                .id(proc.getId())
                .atendimentoId(proc.getAtendimento().getId())
                .tipoProcedimento(proc.getTipoProcedimento())
                .descricao(proc.getDescricao())
                .status(proc.getStatus())
                .executorId(proc.getExecutor() != null ? proc.getExecutor().getId() : null)
                .executorNome(proc.getExecutor() != null ? proc.getExecutor().getNome() : null)
                .dataHoraInicio(proc.getDataHoraInicio())
                .dataHoraFim(proc.getDataHoraFim())
                .observacoes(proc.getObservacoes())
                .criadoEm(proc.getCriadoEm())
                .build();
    }
}
