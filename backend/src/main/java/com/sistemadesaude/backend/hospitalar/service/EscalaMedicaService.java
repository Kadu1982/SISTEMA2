package com.sistemadesaude.backend.hospitalar.service;

import com.sistemadesaude.backend.hospitalar.dto.CriarEscalaMedicaRequest;
import com.sistemadesaude.backend.hospitalar.dto.EscalaMedicaDTO;
import com.sistemadesaude.backend.hospitalar.entity.EscalaMedica;
import com.sistemadesaude.backend.hospitalar.repository.EscalaMedicaRepository;
import com.sistemadesaude.backend.exception.BusinessException;
import com.sistemadesaude.backend.exception.ResourceNotFoundException;
import com.sistemadesaude.backend.response.ApiResponse;
import com.sistemadesaude.backend.operador.repository.OperadorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class EscalaMedicaService {

    private final EscalaMedicaRepository escalaMedicaRepository;
    private final OperadorRepository operadorRepository;

    public ApiResponse<EscalaMedicaDTO> criarEscala(CriarEscalaMedicaRequest request) {
        try {
            log.info("Criando escala médica para profissional: {} na data: {}",
                    request.getProfissionalId(), request.getDataEscala());

            // Validações
            validarDadosEscala(request);

            // Verificar conflitos de escala
            verificarConflitosEscala(request);

            // Criar entidade
            EscalaMedica escala = criarEntidadeEscala(request);

            // Salvar
            escala = escalaMedicaRepository.save(escala);

            // Converter para DTO
            EscalaMedicaDTO dto = convertToDTO(escala);

            log.info("Escala médica criada com sucesso: {}", escala.getId());
            return ApiResponse.success(dto, "Escala médica criada com sucesso");

        } catch (BusinessException e) {
            log.error("Erro de negócio ao criar escala: {}", e.getMessage());
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            log.error("Erro interno ao criar escala: {}", e.getMessage(), e);
            return ApiResponse.error("Erro interno ao criar escala");
        }
    }

    @Transactional(readOnly = true)
    public boolean verificarEscalaAtiva(Long profissionalId, LocalDate data, LocalTime hora) {
        try {
            List<EscalaMedica> escalas = escalaMedicaRepository
                    .findByProfissionalIdAndDataEscalaOrderByHoraInicio(profissionalId, data);

            return escalas.stream()
                    .anyMatch(escala ->
                            escala.getStatusEscala() == EscalaMedica.StatusEscala.ATIVA &&
                            !hora.isBefore(escala.getHoraInicio()) &&
                            !hora.isAfter(escala.getHoraFim())
                    );

        } catch (Exception e) {
            log.error("Erro ao verificar escala ativa: {}", e.getMessage(), e);
            return false;
        }
    }

    public void ocuparVaga(Long profissionalId, LocalDate data) {
        try {
            List<EscalaMedica> escalas = escalaMedicaRepository
                    .findByProfissionalIdAndDataEscalaOrderByHoraInicio(profissionalId, data);

            EscalaMedica escalaDisponivel = escalas.stream()
                    .filter(escala -> escala.getStatusEscala() == EscalaMedica.StatusEscala.ATIVA)
                    .filter(EscalaMedica::hasVagasDisponiveis)
                    .findFirst()
                    .orElseThrow(() -> new BusinessException("Nenhuma escala disponível para ocupar vaga"));

            escalaDisponivel.setVagasOcupadas(escalaDisponivel.getVagasOcupadas() + 1);
            escalaMedicaRepository.save(escalaDisponivel);

            log.info("Vaga ocupada na escala: {}", escalaDisponivel.getId());

        } catch (Exception e) {
            log.error("Erro ao ocupar vaga na escala: {}", e.getMessage(), e);
            throw new BusinessException("Erro ao ocupar vaga na escala");
        }
    }

    public void liberarVaga(Long profissionalId, LocalDate data) {
        try {
            List<EscalaMedica> escalas = escalaMedicaRepository
                    .findByProfissionalIdAndDataEscalaOrderByHoraInicio(profissionalId, data);

            EscalaMedica escalaOcupada = escalas.stream()
                    .filter(escala -> escala.getStatusEscala() == EscalaMedica.StatusEscala.ATIVA)
                    .filter(escala -> escala.getVagasOcupadas() > 0)
                    .findFirst()
                    .orElseThrow(() -> new BusinessException("Nenhuma escala com vagas ocupadas encontrada"));

            escalaOcupada.setVagasOcupadas(escalaOcupada.getVagasOcupadas() - 1);
            escalaMedicaRepository.save(escalaOcupada);

            log.info("Vaga liberada na escala: {}", escalaOcupada.getId());

        } catch (Exception e) {
            log.error("Erro ao liberar vaga na escala: {}", e.getMessage(), e);
            throw new BusinessException("Erro ao liberar vaga na escala");
        }
    }

    @Transactional(readOnly = true)
    public ApiResponse<List<EscalaMedicaDTO>> listarEscalasPorData(LocalDate data, Long unidadeId) {
        try {
            List<EscalaMedica> escalas;

            if (unidadeId != null) {
                escalas = escalaMedicaRepository.findByUnidadeIdAndDataEscalaOrderByHoraInicio(unidadeId, data);
            } else {
                escalas = escalaMedicaRepository.findEscalasAtivasPorData(data);
            }

            List<EscalaMedicaDTO> dtos = escalas.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ApiResponse.success(dtos, "Escalas listadas com sucesso");

        } catch (Exception e) {
            log.error("Erro ao listar escalas: {}", e.getMessage(), e);
            return ApiResponse.error("Erro ao listar escalas");
        }
    }

    @Transactional(readOnly = true)
    public ApiResponse<List<EscalaMedicaDTO>> listarEscalasComVagas(LocalDate data) {
        try {
            List<EscalaMedica> escalas = escalaMedicaRepository.findEscalasComVagasDisponiveis(data);

            List<EscalaMedicaDTO> dtos = escalas.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ApiResponse.success(dtos, "Escalas com vagas listadas com sucesso");

        } catch (Exception e) {
            log.error("Erro ao listar escalas com vagas: {}", e.getMessage(), e);
            return ApiResponse.error("Erro ao listar escalas com vagas");
        }
    }

    public ApiResponse<EscalaMedicaDTO> inativarEscala(Long escalaId, Long operadorId, String motivo) {
        try {
            EscalaMedica escala = buscarEscalaPorId(escalaId);

            if (escala.getStatusEscala() != EscalaMedica.StatusEscala.ATIVA) {
                throw new BusinessException("Apenas escalas ativas podem ser inativadas");
            }

            if (escala.getVagasOcupadas() > 0) {
                throw new BusinessException("Não é possível inativar escala com agendamentos confirmados");
            }

            escala.setStatusEscala(EscalaMedica.StatusEscala.INATIVA);
            escala.setObservacoes(motivo);
            escala.setOperadorAlteracao(operadorRepository.findById(operadorId).orElse(null));

            escala = escalaMedicaRepository.save(escala);

            EscalaMedicaDTO dto = convertToDTO(escala);

            log.info("Escala médica inativada: {}", escalaId);
            return ApiResponse.success(dto, "Escala médica inativada com sucesso");

        } catch (Exception e) {
            log.error("Erro ao inativar escala: {}", e.getMessage(), e);
            return ApiResponse.error("Erro ao inativar escala");
        }
    }

    public ApiResponse<EscalaMedicaDTO> bloquearVagas(Long escalaId, Integer quantidadeVagas, Long operadorId, String motivo) {
        try {
            EscalaMedica escala = buscarEscalaPorId(escalaId);

            if (escala.getStatusEscala() != EscalaMedica.StatusEscala.ATIVA) {
                throw new BusinessException("Apenas escalas ativas podem ter vagas bloqueadas");
            }

            if (escala.getVagasLivres() < quantidadeVagas) {
                throw new BusinessException("Não há vagas suficientes disponíveis para bloqueio");
            }

            escala.setVagasBloqueadas(escala.getVagasBloqueadas() + quantidadeVagas);
            escala.setOperadorAlteracao(operadorRepository.findById(operadorId).orElse(null));

            escala = escalaMedicaRepository.save(escala);

            EscalaMedicaDTO dto = convertToDTO(escala);

            log.info("Vagas bloqueadas na escala: {} - Quantidade: {}", escalaId, quantidadeVagas);
            return ApiResponse.success(dto, "Vagas bloqueadas com sucesso");

        } catch (Exception e) {
            log.error("Erro ao bloquear vagas: {}", e.getMessage(), e);
            return ApiResponse.error("Erro ao bloquear vagas");
        }
    }

    private void validarDadosEscala(CriarEscalaMedicaRequest request) {
        // Verificar se operador existe
        if (!operadorRepository.existsById(request.getOperadorCriacaoId())) {
            throw new BusinessException("Operador não encontrado");
        }

        // Verificar se data não é anterior a hoje (exceto para escalas extras)
        if (request.getDataEscala().isBefore(LocalDate.now()) &&
            request.getTipoEscala() != EscalaMedica.TipoEscala.EXTRA) {
            throw new BusinessException("Não é possível criar escala para data anterior à atual");
        }

        // Verificar se hora fim é posterior à hora início
        if (!request.getHoraFim().isAfter(request.getHoraInicio())) {
            throw new BusinessException("Hora de fim deve ser posterior à hora de início");
        }

        // Verificar intervalo mínimo entre consultas
        if (request.getIntervaloConsultaMinutos() < 5) {
            throw new BusinessException("Intervalo entre consultas deve ser de pelo menos 5 minutos");
        }
    }

    private void verificarConflitosEscala(CriarEscalaMedicaRequest request) {
        List<EscalaMedica> conflitos = escalaMedicaRepository.findConflitosEscala(
                request.getProfissionalId(),
                request.getDataEscala(),
                request.getHoraInicio(),
                request.getHoraFim(),
                null
        );

        if (!conflitos.isEmpty()) {
            throw new BusinessException("Profissional já possui escala cadastrada neste horário");
        }
    }

    private EscalaMedica criarEntidadeEscala(CriarEscalaMedicaRequest request) {
        EscalaMedica escala = new EscalaMedica();

        // Dados básicos
        escala.setProfissionalId(request.getProfissionalId());
        escala.setUnidadeId(request.getUnidadeId());
        escala.setEspecialidadeId(request.getEspecialidadeId());
        escala.setDataEscala(request.getDataEscala());
        escala.setHoraInicio(request.getHoraInicio());
        escala.setHoraFim(request.getHoraFim());
        escala.setIntervaloConsultaMinutos(request.getIntervaloConsultaMinutos());
        escala.setVagasDisponiveis(request.getVagasDisponiveis());

        // Dados opcionais
        escala.setTipoEscala(request.getTipoEscala());
        escala.setPermiteEncaixe(request.getPermiteEncaixe());
        escala.setVagasEncaixe(request.getVagasEncaixe());
        escala.setNumeroSala(request.getNumeroSala());
        escala.setObservacoes(request.getObservacoes());

        // Operador
        escala.setOperadorCriacao(operadorRepository.findById(request.getOperadorCriacaoId()).orElse(null));

        return escala;
    }

    private EscalaMedica buscarEscalaPorId(Long id) {
        return escalaMedicaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Escala médica não encontrada"));
    }

    private EscalaMedicaDTO convertToDTO(EscalaMedica escala) {
        EscalaMedicaDTO dto = new EscalaMedicaDTO();

        dto.setId(escala.getId());
        dto.setProfissionalId(escala.getProfissionalId());
        dto.setUnidadeId(escala.getUnidadeId());
        dto.setEspecialidadeId(escala.getEspecialidadeId());
        dto.setDataEscala(escala.getDataEscala());
        dto.setHoraInicio(escala.getHoraInicio());
        dto.setHoraFim(escala.getHoraFim());
        dto.setIntervaloConsultaMinutos(escala.getIntervaloConsultaMinutos());
        dto.setVagasDisponiveis(escala.getVagasDisponiveis());
        dto.setVagasOcupadas(escala.getVagasOcupadas());
        dto.setVagasBloqueadas(escala.getVagasBloqueadas());
        dto.setVagasLivres(escala.getVagasLivres());
        dto.setStatusEscala(escala.getStatusEscala());
        dto.setTipoEscala(escala.getTipoEscala());
        dto.setPermiteEncaixe(escala.getPermiteEncaixe());
        dto.setVagasEncaixe(escala.getVagasEncaixe());
        dto.setNumeroSala(escala.getNumeroSala());
        dto.setObservacoes(escala.getObservacoes());
        dto.setDataCriacao(escala.getDataCriacao());

        if (escala.getOperadorCriacao() != null) {
            dto.setOperadorCriacaoId(escala.getOperadorCriacao().getId());
            dto.setNomeOperadorCriacao(escala.getOperadorCriacao().getNome());
        }

        dto.setDataUltimaAlteracao(escala.getDataUltimaAlteracao());

        // Campos calculados
        dto.setHasVagasDisponiveis(escala.hasVagasDisponiveis());

        if (escala.getHoraInicio() != null && escala.getHoraFim() != null) {
            long totalMinutos = Duration.between(escala.getHoraInicio(), escala.getHoraFim()).toMinutes();
            dto.setTotalHorasEscala((int) (totalMinutos / 60));
            dto.setTotalConsultasPossivel((int) (totalMinutos / escala.getIntervaloConsultaMinutos()));
        }

        return dto;
    }
}