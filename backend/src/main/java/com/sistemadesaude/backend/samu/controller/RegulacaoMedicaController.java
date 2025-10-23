package com.sistemadesaude.backend.samu.controller;

import com.sistemadesaude.backend.samu.dto.OcorrenciaRegulacaoDTO;
import com.sistemadesaude.backend.samu.dto.RegularPacienteDTO;
import com.sistemadesaude.backend.samu.service.RegulacaoMedicaService;
import com.sistemadesaude.backend.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Slf4j
@RestController
@RequestMapping("/api/samu/regulacao")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RegulacaoMedicaController {

    private final RegulacaoMedicaService regulacaoService;

    @GetMapping("/ocorrencias")
    @PreAuthorize("hasRole('SAMU_REGULADOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<OcorrenciaRegulacaoDTO>>> buscarOcorrenciasAguardandoRegulacao(
            Pageable pageable,
            @RequestParam(required = false) Long centralId) {

        try {
            Map<String, Object> filtros = new HashMap<>();
            if (centralId != null) {
                filtros.put("centralId", centralId);
            }

            var ocorrencias = regulacaoService.buscarOcorrenciasAguardandoRegulacao(pageable, filtros);

            ApiResponse<Page<OcorrenciaRegulacaoDTO>> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Ocorrências aguardando regulação listadas com sucesso");
            response.setData(ocorrencias);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao buscar ocorrências para regulação", e);

            ApiResponse<Page<OcorrenciaRegulacaoDTO>> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao buscar ocorrências: " + e.getMessage());

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/ocorrencias/{id}/iniciar")
    @PreAuthorize("hasRole('SAMU_REGULADOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> iniciarRegulacao(
            @PathVariable Long id,
            @RequestHeader("X-Operador-Id") Long medicoReguladorId) {

        try {
            regulacaoService.iniciarRegulacao(id, medicoReguladorId);

            ApiResponse<String> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Regulação iniciada com sucesso");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao iniciar regulação da ocorrência: {}", id, e);

            ApiResponse<String> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao iniciar regulação: " + e.getMessage());

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/pacientes/{id}/regular")
    @PreAuthorize("hasRole('SAMU_REGULADOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> regularPaciente(
            @PathVariable Long id,
            @Valid @RequestBody RegularPacienteDTO dto,
            @RequestHeader("X-Operador-Id") Long medicoReguladorId) {

        try {
            regulacaoService.regularPaciente(id, dto, medicoReguladorId);

            ApiResponse<String> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Paciente regulado com sucesso");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao regular paciente: {}", id, e);

            ApiResponse<String> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao regular paciente: " + e.getMessage());

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/ocorrencias/{id}/finalizar")
    @PreAuthorize("hasRole('SAMU_REGULADOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> finalizarRegulacao(
            @PathVariable Long id,
            @RequestParam(required = false) String recursoApoioExterno,
            @RequestHeader("X-Operador-Id") Long medicoReguladorId) {

        try {
            regulacaoService.finalizarRegulacao(id, recursoApoioExterno, medicoReguladorId);

            ApiResponse<String> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Regulação finalizada com sucesso");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao finalizar regulação da ocorrência: {}", id, e);

            ApiResponse<String> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao finalizar regulação: " + e.getMessage());

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/emergencias")
    @PreAuthorize("hasRole('SAMU_REGULADOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<OcorrenciaRegulacaoDTO>>> buscarOcorrenciasEmergencia() {

        try {
            var ocorrencias = regulacaoService.buscarOcorrenciasEmergencia();

            ApiResponse<List<OcorrenciaRegulacaoDTO>> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Ocorrências de emergência listadas com sucesso");
            response.setData(ocorrencias);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao buscar ocorrências de emergência", e);

            ApiResponse<List<OcorrenciaRegulacaoDTO>> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao buscar emergências: " + e.getMessage());

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/criticas")
    @PreAuthorize("hasRole('SAMU_REGULADOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<OcorrenciaRegulacaoDTO>>> buscarOcorrenciasCriticas() {

        try {
            var ocorrencias = regulacaoService.buscarOcorrenciasCriticas();

            ApiResponse<List<OcorrenciaRegulacaoDTO>> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Ocorrências críticas listadas com sucesso");
            response.setData(ocorrencias);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao buscar ocorrências críticas", e);

            ApiResponse<List<OcorrenciaRegulacaoDTO>> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao buscar críticas: " + e.getMessage());

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/estatisticas")
    @PreAuthorize("hasRole('SAMU_REGULADOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> obterEstatisticasRegulacao(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataInicio,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataFim) {

        try {
            if (dataInicio == null) {
                dataInicio = LocalDateTime.now().minusDays(30);
            }
            if (dataFim == null) {
                dataFim = LocalDateTime.now();
            }

            var estatisticas = regulacaoService.obterEstatisticasRegulacao(dataInicio, dataFim);

            ApiResponse<Map<String, Object>> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Estatísticas obtidas com sucesso");
            response.setData(estatisticas);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao obter estatísticas de regulação", e);

            ApiResponse<Map<String, Object>> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao obter estatísticas: " + e.getMessage());

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
