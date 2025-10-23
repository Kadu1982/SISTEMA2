package com.sistemadesaude.backend.upa.controller;

import com.sistemadesaude.backend.upa.dto.UpaDTO;
import com.sistemadesaude.backend.upa.enums.UpaStatus;
import com.sistemadesaude.backend.upa.service.UpaService;
import com.sistemadesaude.backend.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller para operações da UPA
 */
@RestController
@RequestMapping("/api/upa")
@RequiredArgsConstructor
@Slf4j
public class UpaController {

    private final UpaService upaService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UpaDTO>>> listarTodos(@RequestParam(required = false) String status) {
        try {
            log.info("📋 GET /api/upa - Listando UPAs (status: {})", status);

            List<UpaDTO> upas;
            if (status != null && !status.trim().isEmpty()) {
                try {
                    UpaStatus upaStatus = UpaStatus.valueOf(status.trim().toUpperCase());
                    upas = upaService.listarPorStatus(upaStatus);
                } catch (IllegalArgumentException e) {
                    log.warn("⚠️ Status inválido recebido: '{}', listando todos", status);
                    upas = upaService.listarTodos();
                }
            } else {
                upas = upaService.listarTodos();
            }

            log.info("✅ Retornando {} UPAs", upas.size());
            return ResponseEntity.ok(new ApiResponse<>(true, "UPAs listadas com sucesso", upas));
        } catch (Exception e) {
            log.error("❌ Erro ao listar UPAs", e);
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Erro ao listar UPAs: " + e.getMessage(), null));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UpaDTO>> buscarPorId(@PathVariable Long id) {
        try {
            log.info("🔍 GET /api/upa/{} - Buscando UPA por ID", id);
            UpaDTO upa = upaService.buscarPorId(id);
            log.info("✅ UPA encontrada: {}", id);
            return ResponseEntity.ok(new ApiResponse<>(true, "UPA encontrada", upa));
        } catch (Exception e) {
            log.error("❌ Erro ao buscar UPA por ID: {}", id, e);
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Erro ao buscar UPA: " + e.getMessage(), null));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UpaDTO>> criar(@RequestBody UpaDTO dto) {
        try {
            log.info("➕ POST /api/upa - Criando nova UPA: {}", dto);
            UpaDTO upaSalva = upaService.salvar(dto);
            log.info("✅ UPA criada com ID: {}", upaSalva.getId());
            return ResponseEntity.ok(new ApiResponse<>(true, "UPA criada com sucesso", upaSalva));
        } catch (Exception e) {
            log.error("❌ Erro ao criar UPA", e);
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Erro ao criar UPA: " + e.getMessage(), null));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UpaDTO>> atualizar(@PathVariable Long id, @RequestBody UpaDTO dto) {
        try {
            log.info("🔄 PUT /api/upa/{} - Atualizando UPA: {}", id, dto);
            UpaDTO upaAtualizada = upaService.atualizar(id, dto);
            log.info("✅ UPA atualizada: {}", id);
            return ResponseEntity.ok(new ApiResponse<>(true, "UPA atualizada com sucesso", upaAtualizada));
        } catch (Exception e) {
            log.error("❌ Erro ao atualizar UPA: {}", id, e);
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Erro ao atualizar UPA: " + e.getMessage(), null));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletar(@PathVariable Long id) {
        try {
            log.info("🗑️ DELETE /api/upa/{} - Deletando UPA", id);
            upaService.deletar(id);
            log.info("✅ UPA deletada: {}", id);
            return ResponseEntity.ok(new ApiResponse<>(true, "UPA deletada com sucesso", null));
        } catch (Exception e) {
            log.error("❌ Erro ao deletar UPA: {}", id, e);
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Erro ao deletar UPA: " + e.getMessage(), null));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<UpaDTO>> alterarStatus(@PathVariable Long id, @RequestBody StatusRequest request) {
        try {
            log.info("🔄 PATCH /api/upa/{}/status - Alterando status para: {}", id, request.getStatus());
            
            if (request.getStatus() == null || request.getStatus().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Status é obrigatório", null));
            }
            
            UpaStatus status;
            try {
                status = UpaStatus.valueOf(request.getStatus().trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("⚠️ Status inválido recebido: '{}'", request.getStatus());
                return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Status inválido: " + request.getStatus(), null));
            }
            
            UpaDTO upaAtualizada = upaService.alterarStatus(id, status);
            log.info("✅ Status da UPA {} alterado para {}", id, status);
            return ResponseEntity.ok(new ApiResponse<>(true, "Status alterado com sucesso", upaAtualizada));
        } catch (Exception e) {
            log.error("❌ Erro ao alterar status da UPA: {}", id, e);
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Erro ao alterar status: " + e.getMessage(), null));
        }
    }

    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<ApiResponse<List<UpaDTO>>> listarPorPaciente(@PathVariable Long pacienteId) {
        try {
            log.info("📋 GET /api/upa/paciente/{} - Listando UPAs do paciente", pacienteId);
            List<UpaDTO> upas = upaService.listarPorPaciente(pacienteId);
            log.info("✅ Encontradas {} UPAs para paciente {}", upas.size(), pacienteId);
            return ResponseEntity.ok(new ApiResponse<>(true, "UPAs do paciente listadas", upas));
        } catch (Exception e) {
            log.error("❌ Erro ao listar UPAs do paciente: {}", pacienteId, e);
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Erro ao listar UPAs do paciente: " + e.getMessage(), null));
        }
    }

    // Classe interna para request de mudança de status
    public static class StatusRequest {
        private String status;

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}
