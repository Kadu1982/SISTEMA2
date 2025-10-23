package com.sistemadesaude.backend.recepcao.service;

import com.sistemadesaude.backend.exception.ResourceNotFoundException;
import com.sistemadesaude.backend.recepcao.dto.HorarioExameDTO;
import com.sistemadesaude.backend.recepcao.entity.HorarioExame;
import com.sistemadesaude.backend.recepcao.mapper.HorarioExameMapper;
import com.sistemadesaude.backend.recepcao.repository.HorarioExameRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HorarioExameService {

    private final HorarioExameRepository horarioExameRepository;
    private final HorarioExameMapper horarioExameMapper;

    @Transactional(readOnly = true)
    public List<HorarioExameDTO> listarTodos() {
        log.debug("Listando todos os horários de exames");
        return horarioExameRepository.findAll().stream()
                .map(horarioExameMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<HorarioExameDTO> listarPorUnidade(Long unidadeId) {
        log.debug("Listando horários por unidade: {}", unidadeId);
        return horarioExameRepository.findByUnidadeIdAndAtivoTrue(unidadeId).stream()
                .map(horarioExameMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<HorarioExameDTO> listarPorProfissional(Long profissionalId) {
        log.debug("Listando horários por profissional: {}", profissionalId);
        return horarioExameRepository.findByProfissionalIdAndAtivoTrue(profissionalId).stream()
                .map(horarioExameMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<HorarioExameDTO> listarPorData(Long unidadeId, LocalDate data) {
        DayOfWeek diaSemana = data.getDayOfWeek();
        log.debug("Listando horários para {} ({})", data, diaSemana);
        return horarioExameRepository.findByUnidadeAndDiaSemana(unidadeId, diaSemana).stream()
                .map(horarioExameMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public HorarioExameDTO buscarPorId(Long id) {
        log.debug("Buscando horário ID: {}", id);
        HorarioExame horario = horarioExameRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Horário não encontrado: " + id));
        return horarioExameMapper.toDTO(horario);
    }

    @Transactional
    public HorarioExameDTO criar(HorarioExameDTO dto) {
        log.info("Criando novo horário de exame");

        HorarioExame horario = horarioExameMapper.toEntity(dto);

        if (!horario.isValido()) {
            throw new IllegalArgumentException("Horário inválido: verifique os campos obrigatórios");
        }

        horario = horarioExameRepository.save(horario);
        log.info("Horário criado com ID: {}", horario.getId());

        return horarioExameMapper.toDTO(horario);
    }

    @Transactional
    public HorarioExameDTO atualizar(Long id, HorarioExameDTO dto) {
        log.info("Atualizando horário ID: {}", id);

        HorarioExame horario = horarioExameRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Horário não encontrado: " + id));

        horarioExameMapper.updateEntityFromDTO(dto, horario);

        if (!horario.isValido()) {
            throw new IllegalArgumentException("Horário inválido: verifique os campos obrigatórios");
        }

        horario = horarioExameRepository.save(horario);
        log.info("Horário {} atualizado", id);

        return horarioExameMapper.toDTO(horario);
    }

    @Transactional
    public void deletar(Long id) {
        log.info("Deletando horário ID: {}", id);

        HorarioExame horario = horarioExameRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Horário não encontrado: " + id));

        horario.setAtivo(false);
        horarioExameRepository.save(horario);

        log.info("Horário {} inativado", id);
    }

    @Transactional
    public void ativar(Long id) {
        log.info("Ativando horário ID: {}", id);

        HorarioExame horario = horarioExameRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Horário não encontrado: " + id));

        horario.setAtivo(true);
        horarioExameRepository.save(horario);

        log.info("Horário {} ativado", id);
    }
}