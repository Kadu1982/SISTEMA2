package com.sistemadesaude.backend.operador.controller;

/**
 * OperadorController - ATUALIZADO
 *
 * Alteração: REMOVIDO o método @PutMapping("/{id}/perfis") que conflita com a rota
 * existente em OperadorAcessosController. Mantemos APENAS o handler do OperadorAcessosController,
 * que recebe payload wrapper no formato { "perfis": ["..."] }.
 *
 * Motivo: evitar ambiguidade de mapeamento e incompatibilidade de contrato
 * (array puro vs wrapper), que fazia com que os perfis não fossem gravados.
 */
import com.sistemadesaude.backend.response.ApiResponse;
import com.sistemadesaude.backend.operador.dto.OperadorDTO;
import com.sistemadesaude.backend.operador.service.OperadorService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/operadores")
@RequiredArgsConstructor
public class OperadorController {

    private final OperadorService operadorService;

    // =========================================================
    // LISTAGEM BÁSICA
    // =========================================================
    @GetMapping
    public ResponseEntity<ApiResponse<List<OperadorDTO>>> listarTodos() {
        log.info("Requisição para listar todos os operadores");
        List<OperadorDTO> operadores = operadorService.listarTodos();
        return ResponseEntity.ok(new ApiResponse<>(true, "Operadores listados com sucesso", operadores));
    }

    @GetMapping("/busca")
    public ResponseEntity<ApiResponse<List<OperadorDTO>>> buscarPorTermo(
            @RequestParam(name = "termo", required = false, defaultValue = "") String termo,
            @RequestParam(name = "page", required = false, defaultValue = "0") int page,
            @RequestParam(name = "size", required = false, defaultValue = "20") int size
    ) {
        log.info("Requisição para buscar operadores: termo='{}', page={}, size={}", termo, page, size);
        Pageable pageable = PageRequest.of(page, size);
        Page<OperadorDTO> resultado = operadorService.buscarPorTermo(termo, pageable);
        return ResponseEntity.ok(new ApiResponse<>(true, "Busca realizada com sucesso", resultado.getContent()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OperadorDTO>> obterPorId(@PathVariable Long id) {
        log.info("Requisição para obter operador com ID: {}", id);
        try {
            OperadorDTO operadorDTO = operadorService.obterPorId(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Operador encontrado com sucesso", operadorDTO));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    // =========================================================
    // CRUD
    // =========================================================
    @PostMapping
    public ResponseEntity<ApiResponse<OperadorDTO>> criar(@Valid @RequestBody OperadorDTO operadorDTO) {
        log.info("Requisição para criar novo operador: {}", operadorDTO.getLogin());
        OperadorDTO novoOperador = operadorService.criar(operadorDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Operador criado com sucesso", novoOperador));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<OperadorDTO>> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody OperadorDTO operadorDTO
    ) {
        log.info("Requisição para atualizar operador com ID: {}", id);
        try {
            OperadorDTO operadorAtualizado = operadorService.atualizar(id, operadorDTO);
            return ResponseEntity.ok(new ApiResponse<>(true, "Operador atualizado com sucesso", operadorAtualizado));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletar(@PathVariable Long id) {
        log.warn("Requisição para deletar operador com ID: {}", id);
        try {
            operadorService.deletar(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Operador deletado com sucesso", null));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    // =========================================================
    // STATUS (duas formas para compatibilidade com o front)
    // =========================================================
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> alterarStatusPatch(
            @PathVariable Long id,
            @RequestParam(name = "ativo", required = false) Boolean ativo,
            @RequestBody(required = false) StatusBody body
    ) {
        Boolean valor = ativo != null ? ativo : (body != null ? body.getAtivo() : null);
        if (valor == null) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Parâmetro 'ativo' é obrigatório", null));
        }
        log.info("Requisição PATCH para alterar status do operador {} para {}", id, valor);
        operadorService.alterarStatus(id, valor);
        return ResponseEntity.ok(new ApiResponse<>(true, "Status atualizado com sucesso", null));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> alterarStatusPut(
            @PathVariable Long id,
            @RequestBody StatusBody body
    ) {
        if (body == null || body.getAtivo() == null) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Campo 'ativo' é obrigatório", null));
        }
        log.info("Requisição PUT para alterar status do operador {} para {}", id, body.getAtivo());
        operadorService.alterarStatus(id, body.getAtivo());
        return ResponseEntity.ok(new ApiResponse<>(true, "Status atualizado com sucesso", null));
    }

    @Data
    public static class StatusBody {
        private Boolean ativo;
    }

    // =========================================================
    // [REMOVIDO] /{id}/perfis
    // =========================================================
    // [REMOVIDO] Método duplicado de atribuição de perfis do operador.
    // A rota '/api/operadores/{id}/perfis' permanece no OperadorAcessosController
    // e aceita payload wrapper: { "perfis": ["..."] }.

}
