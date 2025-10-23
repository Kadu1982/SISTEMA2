package com.sistemadesaude.backend.imunizacao.controller;

import com.sistemadesaude.backend.imunizacao.dto.AplicacaoVacinaDTO;
import com.sistemadesaude.backend.imunizacao.service.AplicacaoVacinaService;
import com.sistemadesaude.backend.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Controller para o módulo de Imunização
 * Implementa as regras conforme PDF SAUDE-89155 e SAUDE-89087
 */
@RestController
@RequestMapping("/api/imunizacao")
@RequiredArgsConstructor
@Slf4j
public class ImunizacaoController {

    private final AplicacaoVacinaService aplicacaoVacinaService;

    /**
     * ENDPOINT: POST /api/imunizacao/aplicacoes
     * Registra uma nova aplicação de vacina
     * Aplica automaticamente as regras SAUDE-89155 (Local de Atendimento = Nenhum)
     */
    @PostMapping("/aplicacoes")
    public ResponseEntity<ApiResponse<AplicacaoVacinaDTO>> registrarAplicacao(
            @Valid @RequestBody AplicacaoVacinaDTO dto) {

        log.info("💉 Registrando aplicação de vacina para paciente: {}", dto.getPacienteId());

        try {
            AplicacaoVacinaDTO resultado = aplicacaoVacinaService.registrarAplicacao(dto);

            return ResponseEntity.ok(ApiResponse.<AplicacaoVacinaDTO>builder()
                .success(true)
                .message("Aplicação de vacina registrada com sucesso")
                .data(resultado)
                .build());

        } catch (Exception e) {
            log.error("❌ Erro ao registrar aplicação de vacina", e);
            return ResponseEntity.badRequest().body(ApiResponse.<AplicacaoVacinaDTO>builder()
                .success(false)
                .message("Erro ao registrar aplicação: " + e.getMessage())
                .build());
        }
    }

    /**
     * ENDPOINT: GET /api/imunizacao/aplicacoes/paciente/{pacienteId}
     * Busca histórico de aplicações por paciente
     */
    @GetMapping("/aplicacoes/paciente/{pacienteId}")
    public ResponseEntity<ApiResponse<List<AplicacaoVacinaDTO>>> buscarPorPaciente(
            @PathVariable Long pacienteId) {

        log.info("🔍 Buscando aplicações para paciente: {}", pacienteId);

        try {
            List<AplicacaoVacinaDTO> aplicacoes = aplicacaoVacinaService.buscarPorPaciente(pacienteId);

            return ResponseEntity.ok(ApiResponse.<List<AplicacaoVacinaDTO>>builder()
                .success(true)
                .message("Aplicações encontradas")
                .data(aplicacoes)
                .build());

        } catch (Exception e) {
            log.error("❌ Erro ao buscar aplicações do paciente", e);
            return ResponseEntity.badRequest().body(ApiResponse.<List<AplicacaoVacinaDTO>>builder()
                .success(false)
                .message("Erro ao buscar aplicações: " + e.getMessage())
                .build());
        }
    }

    /**
     * ENDPOINT: GET /api/imunizacao/aplicacoes
     * Busca aplicações com filtros
     */
    @GetMapping("/aplicacoes")
    public ResponseEntity<ApiResponse<Page<AplicacaoVacinaDTO>>> buscarComFiltros(
            @RequestParam(required = false) Long pacienteId,
            @RequestParam(required = false) Long vacinaId,
            @RequestParam(required = false) Long unidadeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim,
            Pageable pageable) {

        log.info("🔍 Buscando aplicações com filtros");

        try {
            Page<AplicacaoVacinaDTO> aplicacoes = aplicacaoVacinaService.buscarComFiltros(
                pacienteId, vacinaId, unidadeId, dataInicio, dataFim, pageable);

            return ResponseEntity.ok(ApiResponse.<Page<AplicacaoVacinaDTO>>builder()
                .success(true)
                .message("Aplicações encontradas")
                .data(aplicacoes)
                .build());

        } catch (Exception e) {
            log.error("❌ Erro ao buscar aplicações com filtros", e);
            return ResponseEntity.badRequest().body(ApiResponse.<Page<AplicacaoVacinaDTO>>builder()
                .success(false)
                .message("Erro ao buscar aplicações: " + e.getMessage())
                .build());
        }
    }

    /**
     * ENDPOINT: PUT /api/imunizacao/aplicacoes/{id}/exportar-rnds
     * Marca aplicação como exportada para RNDS
     * Implementa regra SAUDE-89087 (Envio para RNDS)
     */
    @PutMapping("/aplicacoes/{id}/exportar-rnds")
    public ResponseEntity<ApiResponse<Void>> marcarExportadoRnds(@PathVariable Long id) {

        log.info("📤 Marcando aplicação {} como exportada para RNDS", id);

        try {
            aplicacaoVacinaService.marcarComoExportadoRnds(id);

            return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Aplicação marcada como exportada para RNDS")
                .build());

        } catch (Exception e) {
            log.error("❌ Erro ao marcar exportação RNDS", e);
            return ResponseEntity.badRequest().body(ApiResponse.<Void>builder()
                .success(false)
                .message("Erro ao marcar exportação: " + e.getMessage())
                .build());
        }
    }

    /**
     * ENDPOINT: PUT /api/imunizacao/aplicacoes/{id}/exportar-esus
     * Marca aplicação como exportada para e-SUS AB
     */
    @PutMapping("/aplicacoes/{id}/exportar-esus")
    public ResponseEntity<ApiResponse<Void>> marcarExportadoEsus(@PathVariable Long id) {

        log.info("📤 Marcando aplicação {} como exportada para e-SUS", id);

        try {
            aplicacaoVacinaService.marcarComoExportadoEsus(id);

            return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Aplicação marcada como exportada para e-SUS")
                .build());

        } catch (Exception e) {
            log.error("❌ Erro ao marcar exportação e-SUS", e);
            return ResponseEntity.badRequest().body(ApiResponse.<Void>builder()
                .success(false)
                .message("Erro ao marcar exportação: " + e.getMessage())
                .build());
        }
    }
}