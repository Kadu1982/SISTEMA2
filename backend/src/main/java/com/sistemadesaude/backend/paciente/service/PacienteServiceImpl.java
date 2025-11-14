package com.sistemadesaude.backend.paciente.service;

import com.sistemadesaude.backend.paciente.dto.PacienteDTO;
import com.sistemadesaude.backend.paciente.dto.PacienteListDTO;
import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.paciente.mapper.PacienteMapper;
import com.sistemadesaude.backend.paciente.repository.PacienteRepository;
import com.sistemadesaude.backend.exception.BusinessException;
import com.sistemadesaude.backend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Collections;
import java.util.stream.Collectors;

/**
 * Implementação da interface de serviço de Paciente.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PacienteServiceImpl implements PacienteService {

    private final PacienteRepository repository;
    private final PacienteMapper mapper;
    private final CacheManager cacheManager;

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
    // ✅ TEMPORARIAMENTE DESABILITADO CACHE para evitar problemas de serialização
    // @Cacheable(value = "pacientes", key = "#id", unless = "#result == null")
    public PacienteDTO buscarPacientePorId(Long id) {
        try {
            log.info("🔍 Buscando paciente por ID: {} (sem cache)", id);
            
            // Limpa cache antes de buscar para evitar dados corrompidos
            try {
                var cache = cacheManager.getCache("pacientes");
                if (cache != null) {
                    cache.evictIfPresent(id);
                    log.debug("🗑️ Cache limpo para paciente ID: {} antes da busca", id);
                }
            } catch (Exception cacheEx) {
                log.warn("⚠️ Erro ao limpar cache: {}", cacheEx.getMessage());
            }
            
            Paciente paciente = repository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado com id " + id));
            
            log.info("📋 Paciente encontrado: {} - {}", paciente.getId(), paciente.getNomeCompleto());
            
            try {
                // Tenta converter para DTO
                PacienteDTO dto = mapper.toDTO(paciente);
                
                if (dto == null) {
                    log.error("❌ Mapper retornou null para paciente ID: {}", id);
                    throw new RuntimeException("Erro ao converter paciente para DTO: mapper retornou null");
                }
                
                log.info("✅ DTO criado com sucesso para paciente ID: {} - {}", id, dto.getNomeCompleto());
                return dto;
                
            } catch (Exception e) {
                log.error("❌ Erro ao converter paciente {} para DTO", id);
                log.error("❌ Mensagem: {}", e.getMessage());
                log.error("❌ Classe da exceção: {}", e.getClass().getName());
                if (e.getCause() != null) {
                    log.error("❌ Causa: {} - {}", e.getCause().getClass().getName(), e.getCause().getMessage());
                }
                log.error("❌ Stack trace completo:", e);
                
                throw new RuntimeException("Erro ao converter paciente para DTO: " + e.getMessage(), e);
            }
        } catch (ResourceNotFoundException e) {
            log.warn("⚠️ Paciente não encontrado com ID: {}", id);
            throw e;
        } catch (RuntimeException e) {
            // Re-lança RuntimeExceptions sem modificar
            throw e;
        } catch (Exception e) {
            log.error("❌ Erro inesperado ao buscar paciente por ID {}: {}", id, e.getMessage(), e);
            log.error("❌ Stack trace completo:", e);
            throw new RuntimeException("Erro ao buscar paciente: " + e.getMessage(), e);
        }
    }

    @Override
    @CacheEvict(value = "pacientes", key = "#id")
    public PacienteDTO atualizarPaciente(Long id, PacienteDTO dto) {
        log.info("🔄 Atualizando paciente ID: {}", id);
        
        // Busca a entidade existente
        Paciente pacienteExistente = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado com id " + id));
        
        log.debug("📋 Paciente encontrado: {} - {}", pacienteExistente.getId(), pacienteExistente.getNomeCompleto());
        
        // Valida CPF se estiver sendo alterado
        if (dto.getCpf() != null && !dto.getCpf().equals(pacienteExistente.getCpf())) {
            if (repository.existsByCpf(dto.getCpf())) {
                log.warn("⚠️ Tentativa de atualizar CPF para um CPF já existente: {}", dto.getCpf());
                throw new BusinessException("Já existe um paciente com este CPF");
            }
        }
        
        // Valida CNS se estiver sendo alterado
        if (dto.getCns() != null && !dto.getCns().equals(pacienteExistente.getCns())) {
            if (repository.existsByCns(dto.getCns())) {
                log.warn("⚠️ Tentativa de atualizar CNS para um CNS já existente: {}", dto.getCns());
                throw new BusinessException("Já existe um paciente com este CNS");
            }
        }
        
        // Garante que o ID do DTO está correto
        dto.setId(id);
        
        // ✅ CORREÇÃO: Atualiza a entidade existente em vez de criar uma nova
        mapper.updateEntityFromDTO(dto, pacienteExistente);
        
        // Salva a entidade atualizada (com ID preservado, faz UPDATE)
        Paciente atualizado = repository.save(pacienteExistente);
        
        log.info("✅ Paciente atualizado com sucesso: {} - {}", atualizado.getId(), atualizado.getNomeCompleto());
        
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
        if (termo == null || termo.trim().isEmpty()) {
            return Collections.emptyList();
        }
        
        // Remove máscaras e caracteres não numéricos para busca de CPF/CNS
        String termoSemMascara = termo.replaceAll("[^0-9]", "");
        
        // Se o termo original é apenas números (sem espaços), não busca por nome (apenas por CPF/CNS)
        String termoLimpo = termo.replaceAll("\\s", "");
        String termoParaNome = (termoSemMascara.length() > 0 && termoSemMascara.length() == termoLimpo.length()) 
                ? null 
                : termo.trim();
        
        // Se termoSemMascara está vazio, passa null para a query
        String termoSemMascaraParaQuery = termoSemMascara.isEmpty() ? null : termoSemMascara;
        
        log.debug("🔍 buscarPorMultiplosCriterios - termo original: '{}', termo para nome: '{}', termoSemMascara: '{}'", 
                termo, termoParaNome, termoSemMascaraParaQuery);
        
        List<Paciente> resultados = repository.buscarPorMultiplosCriterios(termoParaNome, termoSemMascaraParaQuery);
        
        log.debug("📊 Resultados encontrados: {} paciente(s)", resultados.size());
        if (!resultados.isEmpty()) {
            log.debug("📋 Primeiros 3 resultados: {}", resultados.stream()
                    .limit(3)
                    .map(p -> String.format("ID:%d, Nome:%s, CPF:%s", p.getId(), p.getNomeCompleto(), p.getCpf()))
                    .collect(Collectors.joining(" | ")));
        }
        
        return resultados.stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PacienteDTO buscarPorCpf(String cpf) {
        if (cpf == null || cpf.trim().isEmpty()) {
            return null;
        }
        // Remove máscaras e caracteres não numéricos
        String cpfLimpo = cpf.replaceAll("[^0-9]", "");
        if (cpfLimpo.isEmpty()) {
            return null;
        }
        try {
            return repository.findByCpf(cpfLimpo)
                    .map(paciente -> {
                        try {
                            return mapper.toDTO(paciente);
                        } catch (Exception e) {
                            log.error("❌ Erro ao converter paciente para DTO ao buscar por CPF {}: {}", cpfLimpo, e.getMessage(), e);
                            throw new RuntimeException("Erro ao converter paciente para DTO: " + e.getMessage(), e);
                        }
                    })
                    .orElse(null);
        } catch (Exception e) {
            log.error("❌ Erro ao buscar paciente por CPF {}: {}", cpfLimpo, e.getMessage(), e);
            throw new RuntimeException("Erro ao buscar paciente por CPF: " + e.getMessage(), e);
        }
    }

    @Override
    public PacienteDTO buscarPorCns(String cns) {
        if (cns == null || cns.trim().isEmpty()) {
            return null;
        }
        // Remove máscaras e caracteres não numéricos
        String cnsLimpo = cns.replaceAll("[^0-9]", "");
        if (cnsLimpo.isEmpty()) {
            return null;
        }
        try {
            return repository.findByCns(cnsLimpo)
                    .map(paciente -> {
                        try {
                            return mapper.toDTO(paciente);
                        } catch (Exception e) {
                            log.error("❌ Erro ao converter paciente para DTO ao buscar por CNS {}: {}", cnsLimpo, e.getMessage(), e);
                            throw new RuntimeException("Erro ao converter paciente para DTO: " + e.getMessage(), e);
                        }
                    })
                    .orElse(null);
        } catch (Exception e) {
            log.error("❌ Erro ao buscar paciente por CNS {}: {}", cnsLimpo, e.getMessage(), e);
            throw new RuntimeException("Erro ao buscar paciente por CNS: " + e.getMessage(), e);
        }
    }
}
