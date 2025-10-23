package com.sistemadesaude.backend.profissional.service;

import com.sistemadesaude.backend.profissional.dto.ProfissionalDTO;

import java.util.List;
import java.util.Optional;

public interface ProfissionalService {
    List<ProfissionalDTO> listar(String q);
    Optional<ProfissionalDTO> buscarPorId(Long id);
    ProfissionalDTO salvar(ProfissionalDTO dto);
    ProfissionalDTO atualizar(Long id, ProfissionalDTO dto);
    void deletar(Long id);
}
