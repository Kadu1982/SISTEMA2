package com.sistemadesaude.backend.hospitalar.service;

import com.sistemadesaude.backend.hospitalar.dto.LeitoDTO;
import com.sistemadesaude.backend.hospitalar.dto.SolicitarLeitoRequest;
import com.sistemadesaude.backend.hospitalar.entity.Leito;
import com.sistemadesaude.backend.hospitalar.entity.SolicitacaoLeito;
import com.sistemadesaude.backend.hospitalar.repository.LeitoRepository;
import com.sistemadesaude.backend.hospitalar.repository.SolicitacaoLeitoRepository;
import com.sistemadesaude.backend.paciente.repository.PacienteRepository;
import com.sistemadesaude.backend.response.ApiResponse;
import com.sistemadesaude.backend.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeitoService {

    private final LeitoRepository leitoRepository;
    private final SolicitacaoLeitoRepository solicitacaoRepository;
    private final PacienteRepository pacienteRepository;

    @Transactional
    public ApiResponse<LeitoDTO> ocuparLeito(Long leitoId, Long pacienteId, Long operadorId) {
        try {
            log.info("Ocupando leito: {} para paciente: {}", leitoId, pacienteId);

            Leito leito = leitoRepository.findById(leitoId)
                    .orElseThrow(() -> new BusinessException("Leito não encontrado"));

            if (leito.getStatus() != Leito.StatusLeito.DISPONIVEL) {
                throw new BusinessException("Leito não está disponível para ocupação");
            }

            pacienteRepository.findById(pacienteId)
                    .orElseThrow(() -> new BusinessException("Paciente não encontrado"));

            leito.setStatus(Leito.StatusLeito.OCUPADO);
            leito.setPaciente(pacienteRepository.findById(pacienteId).get());
            leito.setDataOcupacao(LocalDateTime.now());
            leito.setUpdatedAt(LocalDateTime.now());

            leito = leitoRepository.save(leito);

            log.info("Leito ocupado com sucesso: {}", leito.getNumero());
            return ApiResponse.success(convertToDTO(leito));

        } catch (BusinessException e) {
            log.error("Erro de negócio ao ocupar leito: {}", e.getMessage());
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            log.error("Erro inesperado ao ocupar leito", e);
            return ApiResponse.error("Erro interno do servidor");
        }
    }

    @Transactional
    public ApiResponse<LeitoDTO> liberarLeito(Long leitoId, Long operadorId, String motivoLiberacao) {
        try {
            log.info("Liberando leito: {}", leitoId);

            Leito leito = leitoRepository.findById(leitoId)
                    .orElseThrow(() -> new BusinessException("Leito não encontrado"));

            if (leito.getStatus() != Leito.StatusLeito.OCUPADO) {
                throw new BusinessException("Leito não está ocupado");
            }

            leito.setStatus(Leito.StatusLeito.LIMPEZA);
            leito.setPaciente(null);
            leito.setDataLiberacao(LocalDateTime.now());
            // Nota: Campo operadorLiberacaoId não existe na entidade, removido
            leito.setMotivoInterdicao(motivoLiberacao); // Usando campo disponível na entidade
            leito.setUpdatedAt(LocalDateTime.now());

            leito = leitoRepository.save(leito);

            log.info("Leito liberado com sucesso: {}", leito.getNumero());
            return ApiResponse.success(convertToDTO(leito));

        } catch (BusinessException e) {
            log.error("Erro de negócio ao liberar leito: {}", e.getMessage());
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            log.error("Erro inesperado ao liberar leito", e);
            return ApiResponse.error("Erro interno do servidor");
        }
    }

    @Transactional
    public ApiResponse<String> transferirPaciente(Long leitoOrigemId, Long leitoDestinoId, Long operadorId, String motivoTransferencia) {
        try {
            log.info("Transferindo paciente do leito: {} para leito: {}", leitoOrigemId, leitoDestinoId);

            Leito leitoOrigem = leitoRepository.findById(leitoOrigemId)
                    .orElseThrow(() -> new BusinessException("Leito de origem não encontrado"));

            Leito leitoDestino = leitoRepository.findById(leitoDestinoId)
                    .orElseThrow(() -> new BusinessException("Leito de destino não encontrado"));

            if (leitoOrigem.getStatus() != Leito.StatusLeito.OCUPADO) {
                throw new BusinessException("Leito de origem não está ocupado");
            }

            if (leitoDestino.getStatus() != Leito.StatusLeito.DISPONIVEL) {
                throw new BusinessException("Leito de destino não está disponível");
            }

            var paciente = leitoOrigem.getPaciente();

            // Liberar leito origem
            leitoOrigem.setStatus(Leito.StatusLeito.LIMPEZA);
            leitoOrigem.setPaciente(null);
            leitoOrigem.setDataLiberacao(LocalDateTime.now());
            // Nota: Campo operadorLiberacaoId não existe na entidade, removido
            leitoOrigem.setMotivoInterdicao("Transferência - " + motivoTransferencia);
            leitoOrigem.setUpdatedAt(LocalDateTime.now());

            // Ocupar leito destino
            leitoDestino.setStatus(Leito.StatusLeito.OCUPADO);
            leitoDestino.setPaciente(paciente);
            leitoDestino.setDataOcupacao(LocalDateTime.now());
            // Nota: Campo operadorOcupacaoId não existe na entidade, removido
            leitoDestino.setUpdatedAt(LocalDateTime.now());

            leitoRepository.save(leitoOrigem);
            leitoRepository.save(leitoDestino);

            String mensagem = String.format("Transferência realizada com sucesso do leito %s para %s",
                    leitoOrigem.getNumero(), leitoDestino.getNumero());

            log.info(mensagem);
            return ApiResponse.success(mensagem);

        } catch (BusinessException e) {
            log.error("Erro de negócio ao transferir paciente: {}", e.getMessage());
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            log.error("Erro inesperado ao transferir paciente", e);
            return ApiResponse.error("Erro interno do servidor");
        }
    }

    @Transactional
    public ApiResponse<LeitoDTO> finalizarLimpeza(Long leitoId, Long operadorId) {
        try {
            log.info("Finalizando limpeza do leito: {}", leitoId);

            Leito leito = leitoRepository.findById(leitoId)
                    .orElseThrow(() -> new BusinessException("Leito não encontrado"));

            if (leito.getStatus() != Leito.StatusLeito.LIMPEZA) {
                throw new BusinessException("Leito não está em processo de limpeza");
            }

            leito.setStatus(Leito.StatusLeito.DISPONIVEL);
            leito.setDataLimpeza(LocalDateTime.now());
            // Nota: Campo operadorLimpezaId não existe na entidade, removido
            leito.setUpdatedAt(LocalDateTime.now());

            leito = leitoRepository.save(leito);

            log.info("Limpeza finalizada com sucesso para leito: {}", leito.getNumero());
            return ApiResponse.success(convertToDTO(leito));

        } catch (BusinessException e) {
            log.error("Erro de negócio ao finalizar limpeza: {}", e.getMessage());
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            log.error("Erro inesperado ao finalizar limpeza", e);
            return ApiResponse.error("Erro interno do servidor");
        }
    }

    public ApiResponse<List<LeitoDTO>> listarLeitosDisponiveis(Long unidadeId) {
        try {
            List<Leito> leitos = leitoRepository
                    .findByStatusAndUnidade_IdAndAtivoTrue(Leito.StatusLeito.DISPONIVEL, unidadeId);

            List<LeitoDTO> dtos = leitos.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ApiResponse.success(dtos);

        } catch (Exception e) {
            log.error("Erro ao listar leitos disponíveis", e);
            return ApiResponse.error("Erro interno do servidor");
        }
    }

    public ApiResponse<List<LeitoDTO>> listarLeitosPorStatus(Long unidadeId, Leito.StatusLeito status) {
        try {
            List<Leito> leitos = leitoRepository
                    .findByStatusAndUnidade_IdAndAtivoTrue(status, unidadeId);

            List<LeitoDTO> dtos = leitos.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ApiResponse.success(dtos);

        } catch (Exception e) {
            log.error("Erro ao listar leitos por status", e);
            return ApiResponse.error("Erro interno do servidor");
        }
    }

    public ApiResponse<Map<String, Object>> obterEstatisticasLeitos(Long unidadeId) {
        try {
            Long totalLeitos = leitoRepository.findByUnidade_IdAndAtivoTrueOrderByEnfermariaAscNumeroAsc(unidadeId).size() * 1L;
            Long leitosDisponives = leitoRepository.countByStatusAndUnidade(Leito.StatusLeito.DISPONIVEL, unidadeId);
            Long leitosOcupados = leitoRepository.countByStatusAndUnidade(Leito.StatusLeito.OCUPADO, unidadeId);
            Long leitosLimpeza = leitoRepository.countByStatusAndUnidade(Leito.StatusLeito.LIMPEZA, unidadeId);
            Long leitosInterditados = leitoRepository.countByStatusAndUnidade(Leito.StatusLeito.INTERDITADO, unidadeId);

            Double taxaOcupacao = totalLeitos > 0 ? (leitosOcupados.doubleValue() / totalLeitos.doubleValue()) * 100 : 0.0;

            Map<String, Object> estatisticas = Map.of(
                "totalLeitos", totalLeitos,
                "leitosDisponiveis", leitosDisponives,
                "leitosOcupados", leitosOcupados,
                "leitosLimpeza", leitosLimpeza,
                "leitosInterditados", leitosInterditados,
                "taxaOcupacao", Math.round(taxaOcupacao * 100.0) / 100.0
            );

            return ApiResponse.success(estatisticas);

        } catch (Exception e) {
            log.error("Erro ao obter estatísticas de leitos", e);
            return ApiResponse.error("Erro interno do servidor");
        }
    }

    @Transactional
    public ApiResponse<String> solicitarLeito(SolicitarLeitoRequest request) {
        try {
            log.info("Solicitando leito para paciente: {}", request.getPacienteId());

            pacienteRepository.findById(request.getPacienteId())
                    .orElseThrow(() -> new BusinessException("Paciente não encontrado"));

            SolicitacaoLeito solicitacao = new SolicitacaoLeito();
            solicitacao.setPaciente(pacienteRepository.findById(request.getPacienteId()).get());
            solicitacao.setTipoAcomodacaoSolicitada(com.sistemadesaude.backend.hospitalar.entity.Leito.TipoAcomodacao.valueOf(request.getTipoAcomodacaoSolicitada()));
            solicitacao.setEspecialidadeSolicitada(request.getEspecialidadeSolicitada());
            solicitacao.setUnidadeSolicitada(request.getUnidadeSolicitada());
            solicitacao.setPrioridade(SolicitacaoLeito.PrioridadeSolicitacao.valueOf(request.getPrioridade()));
            solicitacao.setObservacoesClinicas(request.getObservacoesClinicas());
            solicitacao.setMotivoInternacao(request.getMotivoInternacao());
            solicitacao.setStatus(SolicitacaoLeito.StatusSolicitacao.SOLICITADO);
            solicitacao.setDataSolicitacao(LocalDateTime.now());
            solicitacao.setDataNecessidade(request.getDataNecessidade());

            solicitacaoRepository.save(solicitacao);

            log.info("Solicitação de leito criada com sucesso");
            return ApiResponse.success("Solicitação de leito criada com sucesso");

        } catch (BusinessException e) {
            log.error("Erro de negócio ao solicitar leito: {}", e.getMessage());
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            log.error("Erro inesperado ao solicitar leito", e);
            return ApiResponse.error("Erro interno do servidor");
        }
    }

    private LeitoDTO convertToDTO(Leito leito) {
        LeitoDTO dto = new LeitoDTO();
        dto.setId(leito.getId());
        dto.setNumero(leito.getNumero());
        dto.setAndar(leito.getAndar());
        dto.setAla(leito.getAla());
        dto.setEnfermaria(leito.getEnfermaria());
        dto.setTipoAcomodacao(leito.getTipoAcomodacao());
        dto.setStatus(leito.getStatus());
        dto.setUnidadeId(leito.getUnidade() != null ? leito.getUnidade().getId() : null);
        dto.setNomeUnidade(leito.getUnidade() != null ? leito.getUnidade().getNome() : null);
        dto.setSetorId(leito.getSetorId());
        dto.setPacienteId(leito.getPaciente() != null ? leito.getPaciente().getId() : null);
        dto.setNomePaciente(leito.getPaciente() != null ? leito.getPaciente().getNomeCompleto() : null);
        dto.setAtendimentoId(leito.getAtendimentoId());
        dto.setDataOcupacao(leito.getDataOcupacao());
        dto.setDataLiberacao(leito.getDataLiberacao());
        dto.setDataLimpeza(leito.getDataLimpeza());
        dto.setTipoLimpezaNecessaria(leito.getTipoLimpezaNecessaria());
        dto.setStatusLimpeza(leito.getStatusLimpeza());
        dto.setMotivoInterdicao(leito.getMotivoInterdicao());
        dto.setDataInterdicao(leito.getDataInterdicao());
        dto.setResponsavelInterdicaoId(leito.getResponsavelInterdicao() != null ? leito.getResponsavelInterdicao().getId() : null);
        dto.setNomeResponsavelInterdicao(leito.getResponsavelInterdicao() != null ? leito.getResponsavelInterdicao().getNome() : null);
        dto.setObservacoes(leito.getObservacoes());
        dto.setDiasOcupacao(leito.getDataOcupacao() != null ? (int) java.time.Duration.between(leito.getDataOcupacao(), LocalDateTime.now()).toDays() : null);
        dto.setAtivo(leito.getAtivo());
        return dto;
    }
}