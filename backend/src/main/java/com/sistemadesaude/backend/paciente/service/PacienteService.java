package com.sistemadesaude.backend.paciente.service;

import com.sistemadesaude.backend.paciente.dto.PacienteDTO;
import com.sistemadesaude.backend.paciente.dto.PacienteListDTO;

import java.util.List;

/**
 * Interface de serviço para operações relacionadas ao Paciente.
 */
public interface PacienteService {

    /**
     * Cria um novo paciente
     */
    PacienteDTO criarPaciente(PacienteDTO dto);

    /**
     * Busca paciente por ID
     */
    PacienteDTO buscarPacientePorId(Long id);

    /**
     * Atualiza um paciente
     */
    PacienteDTO atualizarPaciente(Long id, PacienteDTO dto);

    /**
     * Exclui um paciente
     */
    void excluirPaciente(Long id);

    /**
     * Busca pacientes por nome
     */
    List<PacienteListDTO> buscarPacientesPorNome(String nome);

    /**
     * Lista todos os pacientes
     */
    List<PacienteListDTO> listarTodosPacientes();

    /**
     * Verifica se o paciente está em vulnerabilidade
     */
    boolean verificarVulnerabilidade(Long id);

    // Métodos auxiliares
    List<PacienteDTO> listarTodos();
    PacienteDTO criar(PacienteDTO dto);
    PacienteDTO buscarPorId(Long id);
    List<PacienteDTO> buscarPorMultiplosCriterios(String termo);
    PacienteDTO buscarPorCpf(String cpf);
    PacienteDTO buscarPorCns(String cns);
}
