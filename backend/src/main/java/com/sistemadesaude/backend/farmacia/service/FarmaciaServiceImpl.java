package com.sistemadesaude.backend.farmacia.service;

import com.sistemadesaude.backend.farmacia.dto.FarmaciaDTO;
import com.sistemadesaude.backend.farmacia.entity.Farmacia;
import com.sistemadesaude.backend.farmacia.repository.FarmaciaRepository;
import com.sistemadesaude.backend.farmacia.mapper.FarmaciaMapper;
import com.sistemadesaude.backend.unidadesaude.entity.UnidadeSaude;
import com.sistemadesaude.backend.unidadesaude.repository.UnidadeSaudeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Implementação da interface de serviço da Farmácia.
 */
@Service
@RequiredArgsConstructor
public class FarmaciaServiceImpl implements FarmaciaService {

    private final FarmaciaRepository farmaciaRepository;
    private final FarmaciaMapper farmaciaMapper;
    private final UnidadeSaudeRepository unidadeSaudeRepository;

    @Override
    public List<FarmaciaDTO> listarTodas() {
        return farmaciaRepository.findAll()
                .stream()
                .map(farmaciaMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<FarmaciaDTO> buscarPorId(Long id) {
        return farmaciaRepository.findById(id)
                .map(farmaciaMapper::toDTO);
    }

    @Override
    public FarmaciaDTO salvar(FarmaciaDTO dto) {
        // Validar se a unidade de saúde existe
        UnidadeSaude unidade = unidadeSaudeRepository.findById(dto.getUnidadeSaudeId())
                .orElseThrow(() -> new RuntimeException("Unidade de Saúde não encontrada"));

        // Converter DTO para entidade
        Farmacia farmacia = farmaciaMapper.toEntity(dto);
        farmacia.setUnidadeSaude(unidade);

        // Salvar e retornar
        Farmacia salva = farmaciaRepository.save(farmacia);
        return farmaciaMapper.toDTO(salva);
    }

    @Override
    public void deletar(Long id) {
        farmaciaRepository.deleteById(id);
    }
}
