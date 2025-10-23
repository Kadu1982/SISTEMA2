package com.sistemadesaude.backend.operador.service;

import com.sistemadesaude.backend.operador.dto.OperadorDTO;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Camada de serviço para regras do Operador.
 *
 * ⚠️ Esta interface expõe exatamente as assinaturas usadas pelo OperadorController:
 * - listarTodos
 * - buscarPorTermo
 * - obterPorId
 * - criar
 * - atualizar
 * - alterarStatus
 * - deletar
 *
 * Se o seu projeto já tiver outros métodos, mantenha-os aqui também (não conflita).
 */
public interface OperadorService {

    /**
     * Lista todos os operadores (sem paginação).
     */
    List<OperadorDTO> listarTodos();

    /**
     * Busca paginada por termo livre (nome, login, cpf, e-mail etc).
     */
    Page<OperadorDTO> buscarPorTermo(String termo, Pageable pageable);

    /**
     * Obtém um operador por ID.
     * Usado por GET /api/operadores/{id} no controller.
     */
    OperadorDTO obterPorId(Long id) throws EntityNotFoundException;

    /**
     * Cria um novo operador.
     */
    OperadorDTO criar(OperadorDTO dto);

    /**
     * Atualiza os dados do operador existente.
     */
    OperadorDTO atualizar(Long id, OperadorDTO dto) throws EntityNotFoundException;

    /**
     * Altera o status (ativo/inativo) do operador.
     */
    void alterarStatus(Long id, Boolean ativo) throws EntityNotFoundException;

    /**
     * Exclui o operador por ID.
     * Usado por DELETE /api/operadores/{id} no controller.
     */
    void deletar(Long id) throws EntityNotFoundException;
}
