package com.sistemadesaude.backend.exames.service;

import com.sistemadesaude.backend.exames.dto.MaterialExameDTO;
import com.sistemadesaude.backend.exames.entity.MaterialExame;
import com.sistemadesaude.backend.exames.repository.MaterialExameRepository;
import com.sistemadesaude.backend.exception.BusinessException;
import com.sistemadesaude.backend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaterialExameService {

    private final MaterialExameRepository repository;

    @Transactional(readOnly = true)
    public List<MaterialExameDTO> listarTodos() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MaterialExameDTO> listarAtivos() {
        return repository.findByAtivoTrue().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MaterialExameDTO buscarPorId(Long id) {
        MaterialExame material = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material não encontrado"));
        return toDTO(material);
    }

    @Transactional
    public MaterialExameDTO criar(MaterialExameDTO dto) {
        if (dto.getCodigo() != null && repository.findByCodigo(dto.getCodigo()).isPresent()) {
            throw new BusinessException("Já existe um material com o código: " + dto.getCodigo());
        }

        MaterialExame material = toEntity(dto);
        material = repository.save(material);
        return toDTO(material);
    }

    @Transactional
    public MaterialExameDTO atualizar(Long id, MaterialExameDTO dto) {
        MaterialExame material = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material não encontrado"));

        if (dto.getCodigo() != null) {
            repository.findByCodigo(dto.getCodigo()).ifPresent(m -> {
                if (!m.getId().equals(id)) {
                    throw new BusinessException("Já existe outro material com o código: " + dto.getCodigo());
                }
            });
        }

        material.setCodigo(dto.getCodigo());
        material.setSigla(dto.getSigla());
        material.setDescricao(dto.getDescricao());
        material.setAtivo(dto.getAtivo());

        material = repository.save(material);
        return toDTO(material);
    }

    @Transactional
    public void deletar(Long id) {
        MaterialExame material = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material não encontrado"));
        material.setAtivo(false);
        repository.save(material);
    }

    private MaterialExameDTO toDTO(MaterialExame entity) {
        return MaterialExameDTO.builder()
                .id(entity.getId())
                .codigo(entity.getCodigo())
                .sigla(entity.getSigla())
                .descricao(entity.getDescricao())
                .ativo(entity.getAtivo())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private MaterialExame toEntity(MaterialExameDTO dto) {
        return MaterialExame.builder()
                .id(dto.getId())
                .codigo(dto.getCodigo())
                .sigla(dto.getSigla())
                .descricao(dto.getDescricao())
                .ativo(dto.getAtivo() != null ? dto.getAtivo() : true)
                .build();
    }
}