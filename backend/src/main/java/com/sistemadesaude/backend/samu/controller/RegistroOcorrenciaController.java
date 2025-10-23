package com.sistemadesaude.backend.samu.controller;

import com.sistemadesaude.backend.samu.dto.CriarOcorrenciaDTO;
import com.sistemadesaude.backend.samu.dto.OcorrenciaDetalhadaDTO;
import com.sistemadesaude.backend.samu.dto.ResumoOcorrenciaDTO;
import com.sistemadesaude.backend.samu.dto.PacienteOcorrenciaDTO;
import com.sistemadesaude.backend.samu.service.RegistroOcorrenciaService;
import com.sistemadesaude.backend.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@Slf4j
@RestController
@RequestMapping("/api/samu/ocorrencias")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RegistroOcorrenciaController {

    private final RegistroOcorrenciaService registroOcorrenciaService;

    @PostMapping
    @PreAuthorize("hasRole('SAMU_OPERADOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OcorrenciaDetalhadaDTO>> criarOcorrencia(
            @Valid @RequestBody CriarOcorrenciaDTO dto,
            @RequestHeader("X-Operador-Id") Long operadorId) {

        try {
            log.info("Criando nova ocorrência para operador: {}", operadorId);

            var ocorrencia = registroOcorrenciaService.criarOcorrencia(dto, operadorId);

            // ✅ USANDO BUILDER PATTERN OU MÉTODOS ESTÁTICOS DISPONÍVEIS
            ApiResponse<OcorrenciaDetalhadaDTO> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Ocorrência criada com sucesso");
            response.setData(ocorrencia);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao criar ocorrência", e);

            ApiResponse<OcorrenciaDetalhadaDTO> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao criar ocorrência: " + e.getMessage());

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('SAMU_OPERADOR') or hasRole('SAMU_REGULADOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<ResumoOcorrenciaDTO>>> listarOcorrenciasAbertas(
            Pageable pageable,
            @RequestParam(required = false) Long centralId) {

        try {
            var ocorrencias = registroOcorrenciaService.buscarOcorrenciasAbertas(pageable, centralId);

            ApiResponse<Page<ResumoOcorrenciaDTO>> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Ocorrências listadas com sucesso");
            response.setData(ocorrencias);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao listar ocorrências", e);

            ApiResponse<Page<ResumoOcorrenciaDTO>> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao listar ocorrências: " + e.getMessage());

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SAMU_OPERADOR') or hasRole('SAMU_REGULADOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OcorrenciaDetalhadaDTO>> buscarOcorrencia(@PathVariable Long id) {

        try {
            var ocorrencia = registroOcorrenciaService.buscarOcorrenciaDetalhada(id);

            ApiResponse<OcorrenciaDetalhadaDTO> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Ocorrência encontrada");
            response.setData(ocorrencia);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao buscar ocorrência: {}", id, e);

            ApiResponse<OcorrenciaDetalhadaDTO> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao buscar ocorrência: " + e.getMessage());

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/{id}/encaminhar-regulacao")
    @PreAuthorize("hasRole('SAMU_OPERADOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> encaminharParaRegulacao(
            @PathVariable Long id,
            @RequestHeader("X-Operador-Id") Long operadorId) {

        try {
            registroOcorrenciaService.encaminharParaRegulacao(id, operadorId);

            ApiResponse<String> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Ocorrência encaminhada para regulação com sucesso");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao encaminhar ocorrência para regulação: {}", id, e);

            ApiResponse<String> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao encaminhar para regulação: " + e.getMessage());

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/{id}/pacientes")
    @PreAuthorize("hasRole('SAMU_OPERADOR') or hasRole('SAMU_REGULADOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> adicionarPaciente(
            @PathVariable Long id,
            @Valid @RequestBody PacienteOcorrenciaDTO pacienteDto,
            @RequestHeader("X-Operador-Id") Long operadorId) {

        try {
            registroOcorrenciaService.adicionarPaciente(id, pacienteDto, operadorId);

            ApiResponse<String> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Paciente adicionado com sucesso");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao adicionar paciente à ocorrência: {}", id, e);

            ApiResponse<String> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao adicionar paciente: " + e.getMessage());

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping("/{id}/localizacao")
    @PreAuthorize("hasRole('SAMU_OPERADOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> atualizarLocalizacao(
            @PathVariable Long id,
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestHeader("X-Operador-Id") Long operadorId) {

        try {
            registroOcorrenciaService.atualizarLocalizacao(id, latitude, longitude, operadorId);

            ApiResponse<String> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Localização atualizada com sucesso");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao atualizar localização da ocorrência: {}", id, e);

            ApiResponse<String> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao atualizar localização: " + e.getMessage());

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
