package com.sistemadesaude.backend.hospitalar.service;

import com.sistemadesaude.backend.hospitalar.dto.FilaAtendimentoDTO;
import com.sistemadesaude.backend.hospitalar.entity.FilaAtendimento;
import com.sistemadesaude.backend.hospitalar.repository.FilaAtendimentoRepository;
import com.sistemadesaude.backend.response.ApiResponse;
import com.sistemadesaude.backend.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FilaAtendimentoService {

    private final FilaAtendimentoRepository filaRepository;

    public ApiResponse<List<FilaAtendimentoDTO>> listarFilas() {
        try {
            log.info("Listando todas as filas de atendimento");

            List<FilaAtendimento> filas = filaRepository.findByAtivoTrueOrderByNome();

            List<FilaAtendimentoDTO> filasDTO = filas.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ApiResponse.success(filasDTO);
        } catch (Exception e) {
            log.error("Erro ao listar filas", e);
            throw new BusinessException("Erro ao buscar filas de atendimento");
        }
    }

    public ApiResponse<List<FilaAtendimentoDTO>> listarFilasPorUnidade(Long unidadeId) {
        try {
            log.info("Listando filas da unidade: {}", unidadeId);

            List<FilaAtendimento> filas = filaRepository.findByUnidade_IdAndAtivoTrue(unidadeId);

            List<FilaAtendimentoDTO> filasDTO = filas.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ApiResponse.success(filasDTO);
        } catch (Exception e) {
            log.error("Erro ao listar filas da unidade: {}", unidadeId, e);
            throw new BusinessException("Erro ao buscar filas da unidade");
        }
    }

    @Transactional
    public ApiResponse<FilaAtendimentoDTO> criarFila(FilaAtendimentoDTO filaDTO) {
        try {
            log.info("Criando nova fila: {}", filaDTO.getNome());

            // Verificar se já existe fila com mesmo prefixo na unidade
            if (filaRepository.existsByPrefixoSenhaAndUnidade_IdAndIdNot(
                    filaDTO.getPrefixoSenha(), filaDTO.getUnidadeId(), 0L)) {
                throw new BusinessException("Já existe uma fila com este prefixo na unidade");
            }

            FilaAtendimento fila = new FilaAtendimento();
            fila.setNome(filaDTO.getNome());
            fila.setPrefixoSenha(filaDTO.getPrefixoSenha());
            fila.setHorarioInicio(filaDTO.getHorarioInicio());
            fila.setHorarioFim(filaDTO.getHorarioFim());
            fila.setAtivo(true);
            fila.setCreatedAt(LocalDateTime.now());

            FilaAtendimento filaSalva = filaRepository.save(fila);

            return ApiResponse.success(convertToDTO(filaSalva));
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Erro ao criar fila", e);
            throw new BusinessException("Erro ao criar fila de atendimento");
        }
    }

    private FilaAtendimentoDTO convertToDTO(FilaAtendimento fila) {
        FilaAtendimentoDTO dto = new FilaAtendimentoDTO();
        dto.setId(fila.getId());
        dto.setNome(fila.getNome());
        dto.setDescricao(""); // Não usado na entidade atual
        dto.setPrefixoSenha(fila.getPrefixoSenha());
        dto.setHorarioInicio(fila.getHorarioInicio());
        dto.setHorarioFim(fila.getHorarioFim());
        dto.setAtivo(fila.getAtivo());

        // Adicionar estatísticas se necessário (mock por enquanto)
        dto.setSenhasAguardando(0);
        dto.setTempoMedio(0);
        dto.setAtendimentosHoje(0);

        return dto;
    }
}