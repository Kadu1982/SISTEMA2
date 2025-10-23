package com.sistemadesaude.backend.hospitalar.service;

import com.sistemadesaude.backend.hospitalar.dto.EmitirSenhaRequest;
import com.sistemadesaude.backend.hospitalar.dto.ChamarSenhaRequest;
import com.sistemadesaude.backend.hospitalar.dto.SenhaAtendimentoDTO;
import com.sistemadesaude.backend.hospitalar.entity.SenhaAtendimento;
import com.sistemadesaude.backend.hospitalar.entity.FilaAtendimento;
import com.sistemadesaude.backend.hospitalar.repository.SenhaAtendimentoRepository;
import com.sistemadesaude.backend.hospitalar.repository.FilaAtendimentoRepository;
import com.sistemadesaude.backend.paciente.repository.PacienteRepository;
import com.sistemadesaude.backend.response.ApiResponse;
import com.sistemadesaude.backend.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SenhaAtendimentoService {

    private final SenhaAtendimentoRepository senhaRepository;
    private final FilaAtendimentoRepository filaRepository;
    private final PacienteRepository pacienteRepository;

    @Transactional
    public ApiResponse<SenhaAtendimentoDTO> emitirSenha(EmitirSenhaRequest request) {
        try {
            log.info("Emitindo senha para fila: {}", request.getFilaId());

            FilaAtendimento fila = filaRepository.findById(request.getFilaId())
                    .orElseThrow(() -> new BusinessException("Fila não encontrada"));

            if (!fila.getAtivo()) {
                throw new BusinessException("Fila está inativa");
            }

            if (!isHorarioFuncionamento(fila)) {
                throw new BusinessException("Fora do horário de funcionamento da fila");
            }

            if (request.getPacienteId() != null) {
                pacienteRepository.findById(request.getPacienteId())
                        .orElseThrow(() -> new BusinessException("Paciente não encontrado"));
            }

            Integer proximaSequencia = obterProximaSequencia(fila);
            String numeroSenha = gerarNumeroSenha(fila, proximaSequencia, request.getTipoSenha());

            SenhaAtendimento senha = new SenhaAtendimento();
            senha.setNumeroSenha(numeroSenha);
            senha.setSequencia(proximaSequencia);
            senha.setFila(fila);
            if (request.getPacienteId() != null) {
                senha.setPaciente(pacienteRepository.findById(request.getPacienteId()).get());
            }
            senha.setTipoSenha(request.getTipoSenha());
            senha.setStatus(SenhaAtendimento.StatusSenha.AGUARDANDO);
            senha.setDataEmissao(LocalDateTime.now());
            // Nota: Campo operadorEmissaoId não existe na entidade
            // Nota: Campo prioridade não existe na entidade

            senha = senhaRepository.save(senha);

            log.info("Senha emitida com sucesso: {}", numeroSenha);
            return ApiResponse.success(convertToDTO(senha));

        } catch (BusinessException e) {
            log.error("Erro de negócio ao emitir senha: {}", e.getMessage());
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            log.error("Erro inesperado ao emitir senha", e);
            return ApiResponse.error("Erro interno do servidor");
        }
    }

    @Transactional
    public ApiResponse<SenhaAtendimentoDTO> chamarSenha(ChamarSenhaRequest request) {
        try {
            log.info("Chamando próxima senha para fila: {}", request.getFilaId());

            FilaAtendimento fila = filaRepository.findById(request.getFilaId())
                    .orElseThrow(() -> new BusinessException("Fila não encontrada"));

            List<SenhaAtendimento> senhasAguardando = senhaRepository
                    .findProximasSenhasParaChamada(request.getFilaId());

            if (senhasAguardando.isEmpty()) {
                return ApiResponse.error("Não há senhas aguardando na fila");
            }

            SenhaAtendimento proximaSenha = senhasAguardando.get(0);
            proximaSenha.setStatus(SenhaAtendimento.StatusSenha.CHAMADA);
            proximaSenha.setDataChamada(LocalDateTime.now());
            // Nota: Campo operadorChamadaId não existe, usando relacionamento
            proximaSenha.setPosicaoGuiche(request.getPosicaoGuiche());

            proximaSenha = senhaRepository.save(proximaSenha);

            log.info("Senha chamada com sucesso: {}", proximaSenha.getNumeroSenha());
            return ApiResponse.success(convertToDTO(proximaSenha));

        } catch (BusinessException e) {
            log.error("Erro de negócio ao chamar senha: {}", e.getMessage());
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            log.error("Erro inesperado ao chamar senha", e);
            return ApiResponse.error("Erro interno do servidor");
        }
    }

    @Transactional
    public ApiResponse<SenhaAtendimentoDTO> iniciarAtendimento(Long senhaId, Long operadorId) {
        try {
            log.info("Iniciando atendimento para senha: {}", senhaId);

            SenhaAtendimento senha = senhaRepository.findById(senhaId)
                    .orElseThrow(() -> new BusinessException("Senha não encontrada"));

            if (senha.getStatus() != SenhaAtendimento.StatusSenha.CHAMADA) {
                throw new BusinessException("Senha não está em status de chamada");
            }

            senha.setStatus(SenhaAtendimento.StatusSenha.EM_ATENDIMENTO);
            senha.setDataAtendimento(LocalDateTime.now());
            // Nota: Campo operadorAtendimentoId não existe, usando relacionamento

            senha = senhaRepository.save(senha);

            log.info("Atendimento iniciado com sucesso para senha: {}", senha.getNumeroSenha());
            return ApiResponse.success(convertToDTO(senha));

        } catch (BusinessException e) {
            log.error("Erro de negócio ao iniciar atendimento: {}", e.getMessage());
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            log.error("Erro inesperado ao iniciar atendimento", e);
            return ApiResponse.error("Erro interno do servidor");
        }
    }

    @Transactional
    public ApiResponse<SenhaAtendimentoDTO> concluirAtendimento(Long senhaId, String observacoes) {
        try {
            log.info("Concluindo atendimento para senha: {}", senhaId);

            SenhaAtendimento senha = senhaRepository.findById(senhaId)
                    .orElseThrow(() -> new BusinessException("Senha não encontrada"));

            if (senha.getStatus() != SenhaAtendimento.StatusSenha.EM_ATENDIMENTO) {
                throw new BusinessException("Senha não está em atendimento");
            }

            senha.setStatus(SenhaAtendimento.StatusSenha.CONCLUIDA);
            senha.setDataConclusao(LocalDateTime.now());
            senha.setObservacoes(observacoes);

            senha = senhaRepository.save(senha);

            log.info("Atendimento concluído com sucesso para senha: {}", senha.getNumeroSenha());
            return ApiResponse.success(convertToDTO(senha));

        } catch (BusinessException e) {
            log.error("Erro de negócio ao concluir atendimento: {}", e.getMessage());
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            log.error("Erro inesperado ao concluir atendimento", e);
            return ApiResponse.error("Erro interno do servidor");
        }
    }

    public ApiResponse<List<SenhaAtendimentoDTO>> listarSenhasFila(Long filaId) {
        try {
            List<SenhaAtendimento> senhas = senhaRepository
                    .findByFilaIdAndStatusInOrderBySequencia(filaId,
                            List.of(SenhaAtendimento.StatusSenha.AGUARDANDO,
                                   SenhaAtendimento.StatusSenha.CHAMADA,
                                   SenhaAtendimento.StatusSenha.EM_ATENDIMENTO));

            List<SenhaAtendimentoDTO> dtos = senhas.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ApiResponse.success(dtos);

        } catch (Exception e) {
            log.error("Erro ao listar senhas da fila", e);
            return ApiResponse.error("Erro interno do servidor");
        }
    }

    private Integer obterProximaSequencia(FilaAtendimento fila) {
        Optional<Integer> ultimaSequencia = senhaRepository.findUltimaSequenciaDoDia(fila.getId());
        return ultimaSequencia.orElse(0) + 1;
    }

    private String gerarNumeroSenha(FilaAtendimento fila, Integer sequencia, SenhaAtendimento.TipoSenha tipo) {
        String prefixo = fila.getPrefixoSenha();
        if (tipo != SenhaAtendimento.TipoSenha.NORMAL) {
            prefixo += "P";
        }
        return String.format("%s%03d", prefixo, sequencia);
    }

    private boolean isHorarioFuncionamento(FilaAtendimento fila) {
        if (fila.getHorarioInicio() == null || fila.getHorarioFim() == null) {
            return true; // Se não tem horário definido, funciona 24h
        }

        LocalTime agora = LocalTime.now();
        return agora.isAfter(fila.getHorarioInicio()) && agora.isBefore(fila.getHorarioFim());
    }

    private SenhaAtendimentoDTO convertToDTO(SenhaAtendimento senha) {
        SenhaAtendimentoDTO dto = new SenhaAtendimentoDTO();
        dto.setId(senha.getId());
        dto.setNumeroSenha(senha.getNumeroSenha());
        dto.setSequencia(senha.getSequencia());
        dto.setFilaId(senha.getFila().getId());
        dto.setNomeFila(senha.getFila().getNome());
        dto.setPacienteId(senha.getPaciente() != null ? senha.getPaciente().getId() : null);
        dto.setTipoSenha(senha.getTipoSenha());
        dto.setStatus(senha.getStatus());
        // dto.setPrioridade(senha.getPrioridade()); // Campo não existe na entidade
        dto.setDataEmissao(senha.getDataEmissao());
        dto.setDataChamada(senha.getDataChamada());
        dto.setDataAtendimento(senha.getDataAtendimento());
        dto.setDataConclusao(senha.getDataConclusao());
        dto.setPosicaoGuiche(senha.getPosicaoGuiche()); // Campo correto na entidade
        dto.setObservacoes(senha.getObservacoes());
        return dto;
    }
}