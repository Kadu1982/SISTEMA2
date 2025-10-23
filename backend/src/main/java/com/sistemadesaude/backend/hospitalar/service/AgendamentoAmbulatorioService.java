package com.sistemadesaude.backend.hospitalar.service;

import com.sistemadesaude.backend.hospitalar.dto.AgendamentoAmbulatorioDTO;
import com.sistemadesaude.backend.hospitalar.dto.CriarAgendamentoAmbulatorioRequest;
import com.sistemadesaude.backend.hospitalar.entity.AgendamentoAmbulatorio;
import com.sistemadesaude.backend.hospitalar.repository.AgendamentoAmbulatorioRepository;
import com.sistemadesaude.backend.exception.BusinessException;
import com.sistemadesaude.backend.exception.ResourceNotFoundException;
import com.sistemadesaude.backend.response.ApiResponse;
import com.sistemadesaude.backend.paciente.repository.PacienteRepository;
import com.sistemadesaude.backend.operador.repository.OperadorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AgendamentoAmbulatorioService {

    private final AgendamentoAmbulatorioRepository agendamentoRepository;
    private final PacienteRepository pacienteRepository;
    private final OperadorRepository operadorRepository;
    private final EscalaMedicaService escalaMedicaService;

    public ApiResponse<AgendamentoAmbulatorioDTO> criarAgendamento(CriarAgendamentoAmbulatorioRequest request) {
        try {
            log.info("Criando agendamento ambulatorial para paciente: {}", request.getPacienteId());

            // Validações básicas
            validarDadosAgendamento(request);

            // Verificar disponibilidade de horário
            verificarDisponibilidadeHorario(request);

            // Verificar se existe escala médica ativa
            verificarEscalaMedicaAtiva(request);

            // Criar entidade
            AgendamentoAmbulatorio agendamento = criarEntidadeAgendamento(request);

            // Salvar
            agendamento = agendamentoRepository.save(agendamento);

            // Atualizar vaga na escala médica
            escalaMedicaService.ocuparVaga(request.getProfissionalId(), request.getDataAgendamento());

            // Converter para DTO
            AgendamentoAmbulatorioDTO dto = convertToDTO(agendamento);

            log.info("Agendamento criado com sucesso: {}", agendamento.getId());
            return ApiResponse.success(dto, "Agendamento criado com sucesso");

        } catch (BusinessException e) {
            log.error("Erro de negócio ao criar agendamento: {}", e.getMessage());
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            log.error("Erro interno ao criar agendamento: {}", e.getMessage(), e);
            return ApiResponse.error("Erro interno ao criar agendamento");
        }
    }

    public ApiResponse<AgendamentoAmbulatorioDTO> confirmarPresenca(Long agendamentoId, Long operadorId) {
        try {
            AgendamentoAmbulatorio agendamento = buscarAgendamentoPorId(agendamentoId);

            if (agendamento.getStatusAgendamento() != AgendamentoAmbulatorio.StatusAgendamento.CONFIRMADO &&
                agendamento.getStatusAgendamento() != AgendamentoAmbulatorio.StatusAgendamento.AGENDADO) {
                throw new BusinessException("Agendamento não pode ser marcado como presente");
            }

            agendamento.setStatusAgendamento(AgendamentoAmbulatorio.StatusAgendamento.PRESENTE);
            agendamento.setDataChegada(LocalDateTime.now());

            agendamento = agendamentoRepository.save(agendamento);

            AgendamentoAmbulatorioDTO dto = convertToDTO(agendamento);

            log.info("Presença confirmada para agendamento: {}", agendamentoId);
            return ApiResponse.success(dto, "Presença confirmada com sucesso");

        } catch (Exception e) {
            log.error("Erro ao confirmar presença: {}", e.getMessage(), e);
            return ApiResponse.error("Erro ao confirmar presença");
        }
    }

    public ApiResponse<AgendamentoAmbulatorioDTO> chamarPaciente(Long agendamentoId, Long operadorId) {
        try {
            AgendamentoAmbulatorio agendamento = buscarAgendamentoPorId(agendamentoId);

            if (agendamento.getStatusAgendamento() != AgendamentoAmbulatorio.StatusAgendamento.PRESENTE) {
                throw new BusinessException("Paciente deve estar presente para ser chamado");
            }

            agendamento.setStatusAgendamento(AgendamentoAmbulatorio.StatusAgendamento.CHAMADO);
            agendamento.setDataChamada(LocalDateTime.now());

            agendamento = agendamentoRepository.save(agendamento);

            AgendamentoAmbulatorioDTO dto = convertToDTO(agendamento);

            log.info("Paciente chamado para agendamento: {}", agendamentoId);
            return ApiResponse.success(dto, "Paciente chamado com sucesso");

        } catch (Exception e) {
            log.error("Erro ao chamar paciente: {}", e.getMessage(), e);
            return ApiResponse.error("Erro ao chamar paciente");
        }
    }

    public ApiResponse<AgendamentoAmbulatorioDTO> iniciarAtendimento(Long agendamentoId, Long operadorId) {
        try {
            AgendamentoAmbulatorio agendamento = buscarAgendamentoPorId(agendamentoId);

            if (agendamento.getStatusAgendamento() != AgendamentoAmbulatorio.StatusAgendamento.CHAMADO) {
                throw new BusinessException("Paciente deve ter sido chamado para iniciar atendimento");
            }

            agendamento.setStatusAgendamento(AgendamentoAmbulatorio.StatusAgendamento.EM_ATENDIMENTO);
            agendamento.setDataInicioAtendimento(LocalDateTime.now());

            // Calcular tempo de espera
            if (agendamento.getDataChegada() != null) {
                long tempoEspera = java.time.Duration.between(agendamento.getDataChegada(), LocalDateTime.now()).toMinutes();
                agendamento.setTempoEsperaMinutos((int) tempoEspera);
            }

            agendamento = agendamentoRepository.save(agendamento);

            AgendamentoAmbulatorioDTO dto = convertToDTO(agendamento);

            log.info("Atendimento iniciado para agendamento: {}", agendamentoId);
            return ApiResponse.success(dto, "Atendimento iniciado com sucesso");

        } catch (Exception e) {
            log.error("Erro ao iniciar atendimento: {}", e.getMessage(), e);
            return ApiResponse.error("Erro ao iniciar atendimento");
        }
    }

    public ApiResponse<AgendamentoAmbulatorioDTO> finalizarAtendimento(Long agendamentoId, Long operadorId, String observacoes) {
        try {
            AgendamentoAmbulatorio agendamento = buscarAgendamentoPorId(agendamentoId);

            if (agendamento.getStatusAgendamento() != AgendamentoAmbulatorio.StatusAgendamento.EM_ATENDIMENTO) {
                throw new BusinessException("Agendamento deve estar em atendimento para ser finalizado");
            }

            agendamento.setStatusAgendamento(AgendamentoAmbulatorio.StatusAgendamento.ATENDIDO);
            agendamento.setDataFimAtendimento(LocalDateTime.now());
            agendamento.setObservacoesAtendimento(observacoes);

            // Calcular tempo de atendimento
            if (agendamento.getDataInicioAtendimento() != null) {
                long tempoAtendimento = java.time.Duration.between(agendamento.getDataInicioAtendimento(), LocalDateTime.now()).toMinutes();
                agendamento.setTempoAtendimentoMinutos((int) tempoAtendimento);
            }

            agendamento = agendamentoRepository.save(agendamento);

            // Liberar vaga na escala médica
            escalaMedicaService.liberarVaga(agendamento.getProfissionalId(), agendamento.getDataAgendamento());

            AgendamentoAmbulatorioDTO dto = convertToDTO(agendamento);

            log.info("Atendimento finalizado para agendamento: {}", agendamentoId);
            return ApiResponse.success(dto, "Atendimento finalizado com sucesso");

        } catch (Exception e) {
            log.error("Erro ao finalizar atendimento: {}", e.getMessage(), e);
            return ApiResponse.error("Erro ao finalizar atendimento");
        }
    }

    @Transactional(readOnly = true)
    public ApiResponse<List<AgendamentoAmbulatorioDTO>> listarAgendamentosPorData(LocalDate data, Long unidadeId) {
        try {
            List<AgendamentoAmbulatorio> agendamentos;

            if (unidadeId != null) {
                agendamentos = agendamentoRepository.findByUnidadeIdAndDataAgendamentoOrderByHoraAgendamento(unidadeId, data);
            } else {
                agendamentos = agendamentoRepository.findAgendamentosConfirmadosPorData(data);
            }

            List<AgendamentoAmbulatorioDTO> dtos = agendamentos.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ApiResponse.success(dtos, "Agendamentos listados com sucesso");

        } catch (Exception e) {
            log.error("Erro ao listar agendamentos: {}", e.getMessage(), e);
            return ApiResponse.error("Erro ao listar agendamentos");
        }
    }

    @Transactional(readOnly = true)
    public ApiResponse<List<AgendamentoAmbulatorioDTO>> listarPacientesAguardando(LocalDate data) {
        try {
            List<AgendamentoAmbulatorio> agendamentos = agendamentoRepository.findPacientesAguardandoChamada(data);

            List<AgendamentoAmbulatorioDTO> dtos = agendamentos.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ApiResponse.success(dtos, "Pacientes aguardando listados com sucesso");

        } catch (Exception e) {
            log.error("Erro ao listar pacientes aguardando: {}", e.getMessage(), e);
            return ApiResponse.error("Erro ao listar pacientes aguardando");
        }
    }

    @Transactional(readOnly = true)
    public ApiResponse<Map<String, Object>> obterEstatisticasAgendamentos(LocalDate dataInicio, LocalDate dataFim) {
        try {
            List<Object[]> estatisticas = agendamentoRepository.countByStatusAndPeriodo(dataInicio, dataFim);

            Map<String, Object> resultado = estatisticas.stream()
                    .collect(Collectors.toMap(
                            obj -> obj[0].toString(),
                            obj -> obj[1]
                    ));

            return ApiResponse.success(resultado, "Estatísticas obtidas com sucesso");

        } catch (Exception e) {
            log.error("Erro ao obter estatísticas: {}", e.getMessage(), e);
            return ApiResponse.error("Erro ao obter estatísticas");
        }
    }

    private void validarDadosAgendamento(CriarAgendamentoAmbulatorioRequest request) {
        // Verificar se paciente existe
        if (!pacienteRepository.existsById(request.getPacienteId())) {
            throw new BusinessException("Paciente não encontrado");
        }

        // Verificar se operador existe
        if (!operadorRepository.existsById(request.getOperadorCriacaoId())) {
            throw new BusinessException("Operador não encontrado");
        }

        // Verificar se data não é anterior a hoje
        if (request.getDataAgendamento().isBefore(LocalDate.now())) {
            throw new BusinessException("Não é possível agendar para data anterior à atual");
        }
    }

    private void verificarDisponibilidadeHorario(CriarAgendamentoAmbulatorioRequest request) {
        var conflito = agendamentoRepository.findConflitoHorario(
                request.getProfissionalId(),
                request.getDataAgendamento(),
                request.getHoraAgendamento(),
                null
        );

        if (conflito.isPresent()) {
            throw new BusinessException("Horário já ocupado para este profissional");
        }
    }

    private void verificarEscalaMedicaAtiva(CriarAgendamentoAmbulatorioRequest request) {
        boolean temEscalaAtiva = escalaMedicaService.verificarEscalaAtiva(
                request.getProfissionalId(),
                request.getDataAgendamento(),
                request.getHoraAgendamento()
        );

        if (!temEscalaAtiva) {
            throw new BusinessException("Profissional não possui escala ativa para esta data/horário");
        }
    }

    private AgendamentoAmbulatorio criarEntidadeAgendamento(CriarAgendamentoAmbulatorioRequest request) {
        AgendamentoAmbulatorio agendamento = new AgendamentoAmbulatorio();

        // Dados básicos
        agendamento.setPaciente(pacienteRepository.findById(request.getPacienteId()).orElse(null));
        agendamento.setProfissionalId(request.getProfissionalId());
        agendamento.setUnidadeId(request.getUnidadeId());
        agendamento.setEspecialidadeId(request.getEspecialidadeId());
        agendamento.setDataAgendamento(request.getDataAgendamento());
        agendamento.setHoraAgendamento(request.getHoraAgendamento());

        // Dados opcionais
        agendamento.setTipoConsulta(request.getTipoConsulta());
        agendamento.setPrioridade(request.getPrioridade());
        agendamento.setObservacoes(request.getObservacoes());
        agendamento.setMotivoConsulta(request.getMotivoConsulta());
        agendamento.setEncaminhamentoInterno(request.getEncaminhamentoInterno());
        agendamento.setAgendamentoOrigemId(request.getAgendamentoOrigemId());
        agendamento.setNumeroGuia(request.getNumeroGuia());
        agendamento.setConvenioId(request.getConvenioId());
        agendamento.setRetornoProgramado(request.getRetornoProgramado());
        agendamento.setDiasRetorno(request.getDiasRetorno());

        // Operador
        agendamento.setOperadorCriacao(operadorRepository.findById(request.getOperadorCriacaoId()).orElse(null));

        return agendamento;
    }

    private AgendamentoAmbulatorio buscarAgendamentoPorId(Long id) {
        return agendamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento não encontrado"));
    }

    private AgendamentoAmbulatorioDTO convertToDTO(AgendamentoAmbulatorio agendamento) {
        AgendamentoAmbulatorioDTO dto = new AgendamentoAmbulatorioDTO();

        dto.setId(agendamento.getId());
        dto.setPacienteId(agendamento.getPaciente().getId());
        dto.setNomePaciente(agendamento.getPaciente().getNomeCompleto());
        dto.setCpfPaciente(agendamento.getPaciente().getCpf());
        dto.setProfissionalId(agendamento.getProfissionalId());
        dto.setUnidadeId(agendamento.getUnidadeId());
        dto.setEspecialidadeId(agendamento.getEspecialidadeId());
        dto.setDataAgendamento(agendamento.getDataAgendamento());
        dto.setHoraAgendamento(agendamento.getHoraAgendamento());
        dto.setTipoConsulta(agendamento.getTipoConsulta());
        dto.setStatusAgendamento(agendamento.getStatusAgendamento());
        dto.setPrioridade(agendamento.getPrioridade());
        dto.setObservacoes(agendamento.getObservacoes());
        dto.setMotivoConsulta(agendamento.getMotivoConsulta());
        dto.setEncaminhamentoInterno(agendamento.getEncaminhamentoInterno());
        dto.setAgendamentoOrigemId(agendamento.getAgendamentoOrigemId());
        dto.setNumeroGuia(agendamento.getNumeroGuia());
        dto.setConvenioId(agendamento.getConvenioId());
        dto.setRetornoProgramado(agendamento.getRetornoProgramado());
        dto.setDiasRetorno(agendamento.getDiasRetorno());
        dto.setDataCriacao(agendamento.getDataCriacao());

        if (agendamento.getOperadorCriacao() != null) {
            dto.setOperadorCriacaoId(agendamento.getOperadorCriacao().getId());
            dto.setNomeOperadorCriacao(agendamento.getOperadorCriacao().getNome());
        }

        dto.setDataConfirmacao(agendamento.getDataConfirmacao());
        dto.setDataChegada(agendamento.getDataChegada());
        dto.setDataChamada(agendamento.getDataChamada());
        dto.setDataInicioAtendimento(agendamento.getDataInicioAtendimento());
        dto.setDataFimAtendimento(agendamento.getDataFimAtendimento());
        dto.setTempoEsperaMinutos(agendamento.getTempoEsperaMinutos());
        dto.setTempoAtendimentoMinutos(agendamento.getTempoAtendimentoMinutos());
        dto.setNumeroSala(agendamento.getNumeroSala());
        dto.setObservacoesAtendimento(agendamento.getObservacoesAtendimento());

        return dto;
    }
}