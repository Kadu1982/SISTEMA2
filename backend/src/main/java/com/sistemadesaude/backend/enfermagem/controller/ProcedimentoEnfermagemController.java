package com.sistemadesaude.backend.enfermagem.controller;

import com.sistemadesaude.backend.audit.annotation.Audited;
import com.sistemadesaude.backend.audit.entity.AuditLog;
import com.sistemadesaude.backend.enfermagem.dto.ProcedimentoEnfermagemDTO;
import com.sistemadesaude.backend.enfermagem.entity.ProcedimentoEnfermagem.StatusProcedimento;
import com.sistemadesaude.backend.enfermagem.service.ProcedimentoEnfermagemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller REST para Procedimentos de Enfermagem.
 * Gerencia procedimentos rápidos: curativos, medicação, suturas, nebulização, etc.
 */
@Tag(name = "Procedimentos de Enfermagem", description = "Endpoints para gerenciar procedimentos rápidos de enfermagem")
@RestController
@RequestMapping("/api/enfermagem/procedimentos")
@RequiredArgsConstructor
public class ProcedimentoEnfermagemController {

    private final ProcedimentoEnfermagemService procedimentoService;

    @Operation(summary = "Criar novo procedimento",
               description = "Registra novo procedimento para um atendimento")
    @PostMapping
    @Audited(
        tipoOperacao = AuditLog.TipoOperacao.CREATE,
        entidadeTipo = "ProcedimentoEnfermagem",
        descricao = "Criação de procedimento de enfermagem"
    )
    public ResponseEntity<ProcedimentoEnfermagemDTO> criar(@Valid @RequestBody ProcedimentoEnfermagemDTO dto) {
        ProcedimentoEnfermagemDTO criado = procedimentoService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    @Operation(summary = "Buscar procedimento por ID")
    @GetMapping("/{id}")
    @Audited(
        tipoOperacao = AuditLog.TipoOperacao.READ,
        entidadeTipo = "ProcedimentoEnfermagem",
        descricao = "Consulta de procedimento de enfermagem"
    )
    public ResponseEntity<ProcedimentoEnfermagemDTO> buscarPorId(@PathVariable Long id) {
        ProcedimentoEnfermagemDTO procedimento = procedimentoService.buscarPorId(id);
        return ResponseEntity.ok(procedimento);
    }

    @Operation(summary = "Iniciar procedimento",
               description = "Inicia execução do procedimento e atribui executor")
    @PutMapping("/{id}/iniciar")
    @Audited(
        tipoOperacao = AuditLog.TipoOperacao.UPDATE,
        entidadeTipo = "ProcedimentoEnfermagem",
        descricao = "Início de procedimento de enfermagem"
    )
    public ResponseEntity<ProcedimentoEnfermagemDTO> iniciar(
            @PathVariable Long id,
            @RequestParam Long executorId) {
        ProcedimentoEnfermagemDTO procedimento = procedimentoService.iniciarProcedimento(id, executorId);
        return ResponseEntity.ok(procedimento);
    }

    @Operation(summary = "Finalizar procedimento",
               description = "Conclui procedimento e registra observações finais")
    @PutMapping("/{id}/finalizar")
    @Audited(
        tipoOperacao = AuditLog.TipoOperacao.UPDATE,
        entidadeTipo = "ProcedimentoEnfermagem",
        descricao = "Finalização de procedimento de enfermagem"
    )
    public ResponseEntity<ProcedimentoEnfermagemDTO> finalizar(
            @PathVariable Long id,
            @RequestBody ProcedimentoEnfermagemDTO dto) {
        ProcedimentoEnfermagemDTO procedimento = procedimentoService.finalizarProcedimento(id, dto);
        return ResponseEntity.ok(procedimento);
    }

    @Operation(summary = "Cancelar procedimento",
               description = "Cancela procedimento com motivo")
    @PutMapping("/{id}/cancelar")
    @Audited(
        tipoOperacao = AuditLog.TipoOperacao.UPDATE,
        entidadeTipo = "ProcedimentoEnfermagem",
        descricao = "Cancelamento de procedimento de enfermagem"
    )
    public ResponseEntity<ProcedimentoEnfermagemDTO> cancelar(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String motivo = body.get("motivo");
        ProcedimentoEnfermagemDTO procedimento = procedimentoService.cancelarProcedimento(id, motivo);
        return ResponseEntity.ok(procedimento);
    }

    @Operation(summary = "Atualizar procedimento",
               description = "Atualiza campos específicos do procedimento")
    @PutMapping("/{id}")
    @Audited(
        tipoOperacao = AuditLog.TipoOperacao.UPDATE,
        entidadeTipo = "ProcedimentoEnfermagem",
        descricao = "Atualização de procedimento de enfermagem"
    )
    public ResponseEntity<ProcedimentoEnfermagemDTO> atualizar(
            @PathVariable Long id,
            @RequestBody ProcedimentoEnfermagemDTO dto) {
        ProcedimentoEnfermagemDTO procedimento = procedimentoService.atualizar(id, dto);
        return ResponseEntity.ok(procedimento);
    }

    @Operation(summary = "Listar procedimentos por atendimento")
    @GetMapping("/atendimento/{atendimentoId}")
    public ResponseEntity<List<ProcedimentoEnfermagemDTO>> listarPorAtendimento(
            @PathVariable Long atendimentoId) {
        List<ProcedimentoEnfermagemDTO> procedimentos = procedimentoService.listarPorAtendimento(atendimentoId);
        return ResponseEntity.ok(procedimentos);
    }

    @Operation(summary = "Listar procedimentos por atendimento e status")
    @GetMapping("/atendimento/{atendimentoId}/status/{status}")
    public ResponseEntity<List<ProcedimentoEnfermagemDTO>> listarPorAtendimentoEStatus(
            @PathVariable Long atendimentoId,
            @PathVariable StatusProcedimento status) {
        List<ProcedimentoEnfermagemDTO> procedimentos = procedimentoService.listarPorAtendimentoEStatus(atendimentoId, status);
        return ResponseEntity.ok(procedimentos);
    }
}
