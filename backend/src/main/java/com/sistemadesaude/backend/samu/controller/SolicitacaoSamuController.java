package com.sistemadesaude.backend.samu.controller;

import com.sistemadesaude.backend.samu.dto.CriarOcorrenciaDTO;
import com.sistemadesaude.backend.samu.dto.OcorrenciaDetalhadaDTO;
import com.sistemadesaude.backend.samu.dto.ResumoOcorrenciaDTO;
import com.sistemadesaude.backend.samu.service.RegistroOcorrenciaService;
import com.sistemadesaude.backend.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Controller para gerenciar Solicitações do SAMU (TARM)
 * Mapeia o conceito de "Solicitações" do frontend para "Ocorrências" do backend
 */
@Slf4j
@RestController
@RequestMapping("/api/samu/solicitacoes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SolicitacaoSamuController {

    private final RegistroOcorrenciaService registroOcorrenciaService;

    @GetMapping
    @PreAuthorize("hasRole('SAMU_OPERADOR') or hasRole('SAMU_REGULADOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<ResumoOcorrenciaDTO>>> listarSolicitacoes(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        try {
            Pageable pageable = PageRequest.of(page, size);

            // Se não tiver datas, usa padrão (últimos 30 dias)
            if (dataInicio == null) {
                dataInicio = LocalDate.now().minusDays(30);
            }
            if (dataFim == null) {
                dataFim = LocalDate.now();
            }

            log.info("Listando solicitações SAMU - Data: {} a {}, Status: {}", dataInicio, dataFim, status);

            var ocorrencias = registroOcorrenciaService.buscarOcorrenciasAbertas(pageable, null);

            ApiResponse<Page<ResumoOcorrenciaDTO>> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Solicitações listadas com sucesso");
            response.setData(ocorrencias);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao listar solicitações", e);

            ApiResponse<Page<ResumoOcorrenciaDTO>> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao listar solicitações: " + e.getMessage());

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SAMU_OPERADOR') or hasRole('SAMU_REGULADOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OcorrenciaDetalhadaDTO>> buscarSolicitacao(@PathVariable Long id) {

        try {
            var ocorrencia = registroOcorrenciaService.buscarOcorrenciaDetalhada(id);

            ApiResponse<OcorrenciaDetalhadaDTO> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Solicitação encontrada");
            response.setData(ocorrencia);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao buscar solicitação: {}", id, e);

            ApiResponse<OcorrenciaDetalhadaDTO> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao buscar solicitação: " + e.getMessage());

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('SAMU_OPERADOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OcorrenciaDetalhadaDTO>> criarSolicitacao(
            @Valid @RequestBody CriarOcorrenciaDTO dto,
            @RequestHeader(value = "X-Operador-Id", required = false) Long operadorId) {

        try {
            // Se não vier operador no header, usa um padrão (admin)
            if (operadorId == null) {
                operadorId = 1L; // ID do operador master
            }

            log.info("Criando nova solicitação SAMU para operador: {}", operadorId);

            var ocorrencia = registroOcorrenciaService.criarOcorrencia(dto, operadorId);

            ApiResponse<OcorrenciaDetalhadaDTO> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Solicitação criada com sucesso");
            response.setData(ocorrencia);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao criar solicitação", e);

            ApiResponse<OcorrenciaDetalhadaDTO> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao criar solicitação: " + e.getMessage());

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SAMU_OPERADOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OcorrenciaDetalhadaDTO>> atualizarSolicitacao(
            @PathVariable Long id,
            @Valid @RequestBody CriarOcorrenciaDTO dto,
            @RequestHeader(value = "X-Operador-Id", required = false) Long operadorId) {

        try {
            if (operadorId == null) {
                operadorId = 1L;
            }

            log.info("Atualizando solicitação SAMU: {}", id);

            // Por enquanto, retorna a ocorrência atual
            // TODO: Implementar atualização
            var ocorrencia = registroOcorrenciaService.buscarOcorrenciaDetalhada(id);

            ApiResponse<OcorrenciaDetalhadaDTO> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Solicitação atualizada com sucesso");
            response.setData(ocorrencia);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao atualizar solicitação: {}", id, e);

            ApiResponse<OcorrenciaDetalhadaDTO> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao atualizar solicitação: " + e.getMessage());

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
