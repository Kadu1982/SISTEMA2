package com.sistemadesaude.backend.paciente.service;

import com.sistemadesaude.backend.paciente.dto.PacienteDTO;
import com.sistemadesaude.backend.paciente.dto.PacienteListDTO;
import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.paciente.mapper.PacienteMapper;
import com.sistemadesaude.backend.paciente.repository.PacienteRepository;
import com.sistemadesaude.backend.exception.BusinessException;
import com.sistemadesaude.backend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementação da interface de serviço de Paciente.
 */
@Service
@RequiredArgsConstructor
public class PacienteServiceImpl implements PacienteService {

    private final PacienteRepository repository;
    private final PacienteMapper mapper;

    @Override
    @CacheEvict(value = "pacientes", allEntries = true)
    public PacienteDTO criarPaciente(PacienteDTO dto) {
        if (dto.getCpf() != null && repository.existsByCpf(dto.getCpf())) {
            throw new BusinessException("Já existe um paciente com este CPF");
        }
        if (dto.getCns() != null && repository.existsByCns(dto.getCns())) {
            throw new BusinessException("Já existe um paciente com este CNS");
        }
        Paciente entity = mapper.toEntity(dto);
        Paciente salvo = repository.save(entity);
        return mapper.toDTO(salvo);
    }

    @Override
    @Cacheable(value = "pacientes", key = "#id")
    public PacienteDTO buscarPacientePorId(Long id) {
        return repository.findById(id)
                .map(mapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado com id " + id));
    }

    @Override
    public PacienteDTO atualizarPaciente(Long id, PacienteDTO dto) {
        Paciente pacienteExistente = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado com id " + id));
        if (dto.getCpf() != null && !dto.getCpf().equals(pacienteExistente.getCpf())) {
            if (repository.existsByCpf(dto.getCpf())) {
                throw new BusinessException("Já existe um paciente com este CPF");
            }
        }
        if (dto.getCns() != null && !dto.getCns().equals(pacienteExistente.getCns())) {
            if (repository.existsByCns(dto.getCns())) {
                throw new BusinessException("Já existe um paciente com este CNS");
            }
        }
        dto.setId(id);
        Paciente entity = mapper.toEntity(dto);
        Paciente atualizado = repository.save(entity);
        return mapper.toDTO(atualizado);
    }

    @Override
    public void excluirPaciente(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Paciente não encontrado com id " + id);
        }
        repository.deleteById(id);
    }

    @Override
    public List<PacienteListDTO> buscarPacientesPorNome(String nome) {
        Pageable limit = PageRequest.of(0, 20);
        // ✅ CORRIGIDO: Chamando o método 'StartingWith' correto.
        return repository.findByNomeCompletoStartingWithIgnoreCase(nome, limit)
                .stream()
                .map(mapper::toListDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PacienteListDTO> listarTodosPacientes() {
        return repository.findAll()
                .stream()
                .map(mapper::toListDTO)
                .collect(Collectors.toList());
    }

    @Override
    public boolean verificarVulnerabilidade(Long id) {
        Paciente paciente = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado com id " + id));
        return Boolean.TRUE.equals(paciente.getAcamado()) ||
                Boolean.TRUE.equals(paciente.getDomiciliado()) ||
                Boolean.TRUE.equals(paciente.getCondSaudeMental());
    }

    // Métodos auxiliares (compatibilidade)
    @Override
    public List<PacienteDTO> listarTodos() {
        return repository.findAll()
                .stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PacienteDTO criar(PacienteDTO dto) {
        return criarPaciente(dto);
    }

    @Override
    public PacienteDTO buscarPorId(Long id) {
        return buscarPacientePorId(id);
    }

    @Override
    public List<PacienteDTO> buscarPorMultiplosCriterios(String termo) {
        return repository.buscarPorMultiplosCriterios(termo)
                .stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PacienteDTO buscarPorCpf(String cpf) {
        return repository.findByCpf(cpf)
                .map(mapper::toDTO)
                .orElse(null);
    }

    @Override
    public PacienteDTO buscarPorCns(String cns) {
        return repository.findByCns(cns)
                .map(mapper::toDTO)
                .orElse(null);
    }
}
