package com.sistemadesaude.backend.exames.service;

import com.sistemadesaude.backend.exames.dto.GrupoExameDTO;
import com.sistemadesaude.backend.exames.entity.GrupoExame;
import com.sistemadesaude.backend.exames.repository.GrupoExameRepository;
import com.sistemadesaude.backend.exception.BusinessException;
import com.sistemadesaude.backend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GrupoExameService {

    private final GrupoExameRepository repository;

    @Transactional(readOnly = true)
    public List<GrupoExameDTO> listarTodos() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<GrupoExameDTO> listarAtivos() {
        return repository.findByAtivoTrue().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GrupoExameDTO buscarPorId(Long id) {
        GrupoExame grupo = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grupo não encontrado"));
        return toDTO(grupo);
    }

    @Transactional
    public GrupoExameDTO criar(GrupoExameDTO dto) {
        if (dto.getCodigo() != null && repository.findByCodigo(dto.getCodigo()).isPresent()) {
            throw new BusinessException("Já existe um grupo com o código: " + dto.getCodigo());
        }

        GrupoExame grupo = toEntity(dto);
        grupo = repository.save(grupo);
        return toDTO(grupo);
    }

    @Transactional
    public GrupoExameDTO atualizar(Long id, GrupoExameDTO dto) {
        GrupoExame grupo = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grupo não encontrado"));

        if (dto.getCodigo() != null) {
            repository.findByCodigo(dto.getCodigo()).ifPresent(g -> {
                if (!g.getId().equals(id)) {
                    throw new BusinessException("Já existe outro grupo com o código: " + dto.getCodigo());
                }
            });
        }

        grupo.setCodigo(dto.getCodigo());
        grupo.setNome(dto.getNome());
        grupo.setDescricao(dto.getDescricao());
        grupo.setOrdem(dto.getOrdem());
        grupo.setAtivo(dto.getAtivo());

        grupo = repository.save(grupo);
        return toDTO(grupo);
    }

    @Transactional
    public void deletar(Long id) {
        GrupoExame grupo = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grupo não encontrado"));
        grupo.setAtivo(false);
        repository.save(grupo);
    }

    private GrupoExameDTO toDTO(GrupoExame entity) {
        return GrupoExameDTO.builder()
                .id(entity.getId())
                .codigo(entity.getCodigo())
                .nome(entity.getNome())
                .descricao(entity.getDescricao())
                .ordem(entity.getOrdem())
                .ativo(entity.getAtivo())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private GrupoExame toEntity(GrupoExameDTO dto) {
        return GrupoExame.builder()
                .id(dto.getId())
                .codigo(dto.getCodigo())
                .nome(dto.getNome())
                .descricao(dto.getDescricao())
                .ordem(dto.getOrdem())
                .ativo(dto.getAtivo() != null ? dto.getAtivo() : true)
                .build();
    }
}