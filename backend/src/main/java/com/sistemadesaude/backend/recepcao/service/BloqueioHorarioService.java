package com.sistemadesaude.backend.recepcao.service;

import com.sistemadesaude.backend.exception.ResourceNotFoundException;
import com.sistemadesaude.backend.recepcao.dto.BloqueioHorarioDTO;
import com.sistemadesaude.backend.recepcao.entity.BloqueioHorario;
import com.sistemadesaude.backend.recepcao.mapper.BloqueioHorarioMapper;
import com.sistemadesaude.backend.recepcao.repository.BloqueioHorarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BloqueioHorarioService {

    private final BloqueioHorarioRepository bloqueioHorarioRepository;
    private final BloqueioHorarioMapper bloqueioHorarioMapper;

    @Transactional(readOnly = true)
    public List<BloqueioHorarioDTO> listarTodos() {
        log.debug("Listando todos os bloqueios");
        return bloqueioHorarioRepository.findAll().stream()
                .map(bloqueioHorarioMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BloqueioHorarioDTO> listarPorUnidade(Long unidadeId) {
        log.debug("Listando bloqueios por unidade: {}", unidadeId);
        return bloqueioHorarioRepository.findByUnidadeIdAndAtivoTrue(unidadeId).stream()
                .map(bloqueioHorarioMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BloqueioHorarioDTO> listarPorData(Long unidadeId, LocalDate data) {
        log.debug("Listando bloqueios para data: {}", data);
        return bloqueioHorarioRepository.findBloqueiosAtivos(unidadeId, data).stream()
                .map(bloqueioHorarioMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BloqueioHorarioDTO> listarPorPeriodo(Long unidadeId, LocalDate inicio, LocalDate fim) {
        log.debug("Listando bloqueios de {} até {}", inicio, fim);
        return bloqueioHorarioRepository.findBloqueiosNoPeriodo(unidadeId, inicio, fim).stream()
                .map(bloqueioHorarioMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BloqueioHorarioDTO buscarPorId(Long id) {
        log.debug("Buscando bloqueio ID: {}", id);
        BloqueioHorario bloqueio = bloqueioHorarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bloqueio não encontrado: " + id));
        return bloqueioHorarioMapper.toDTO(bloqueio);
    }

    @Transactional
    public BloqueioHorarioDTO criar(BloqueioHorarioDTO dto) {
        log.info("Criando novo bloqueio de horário");

        BloqueioHorario bloqueio = bloqueioHorarioMapper.toEntity(dto);

        if (bloqueio.getDataInicio() == null) {
            throw new IllegalArgumentException("Data de início é obrigatória");
        }

        if (bloqueio.getDataFim() != null && bloqueio.getDataFim().isBefore(bloqueio.getDataInicio())) {
            throw new IllegalArgumentException("Data de fim não pode ser anterior à data de início");
        }

        bloqueio = bloqueioHorarioRepository.save(bloqueio);
        log.info("Bloqueio criado com ID: {}", bloqueio.getId());

        return bloqueioHorarioMapper.toDTO(bloqueio);
    }

    @Transactional
    public BloqueioHorarioDTO atualizar(Long id, BloqueioHorarioDTO dto) {
        log.info("Atualizando bloqueio ID: {}", id);

        BloqueioHorario bloqueio = bloqueioHorarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bloqueio não encontrado: " + id));

        bloqueioHorarioMapper.updateEntityFromDTO(dto, bloqueio);

        if (bloqueio.getDataInicio() == null) {
            throw new IllegalArgumentException("Data de início é obrigatória");
        }

        if (bloqueio.getDataFim() != null && bloqueio.getDataFim().isBefore(bloqueio.getDataInicio())) {
            throw new IllegalArgumentException("Data de fim não pode ser anterior à data de início");
        }

        bloqueio = bloqueioHorarioRepository.save(bloqueio);
        log.info("Bloqueio {} atualizado", id);

        return bloqueioHorarioMapper.toDTO(bloqueio);
    }

    @Transactional
    public void deletar(Long id) {
        log.info("Deletando bloqueio ID: {}", id);

        BloqueioHorario bloqueio = bloqueioHorarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bloqueio não encontrado: " + id));

        bloqueio.setAtivo(false);
        bloqueioHorarioRepository.save(bloqueio);

        log.info("Bloqueio {} inativado", id);
    }
}