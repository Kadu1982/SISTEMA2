package com.sistemadesaude.backend.enfermagem.controller;

import com.sistemadesaude.backend.audit.annotation.Audited;
import com.sistemadesaude.backend.audit.entity.AuditLog;
import com.sistemadesaude.backend.enfermagem.dto.AtendimentoEnfermagemDTO;
import com.sistemadesaude.backend.enfermagem.entity.AtendimentoEnfermagem.StatusAtendimento;
import com.sistemadesaude.backend.enfermagem.service.AtendimentoEnfermagemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller REST para Atendimento de Enfermagem.
 * Gerencia procedimentos rápidos de enfermagem vindos do Ambulatorial ou UPA.
 */
@Tag(name = "Atendimento de Enfermagem", description = "Endpoints para gerenciar atendimentos de enfermagem (procedimentos rápidos)")
@RestController
@RequestMapping("/api/enfermagem/atendimentos")
@RequiredArgsConstructor
public class AtendimentoEnfermagemController {

    private final AtendimentoEnfermagemService atendimentoService;

    @Operation(summary = "Criar novo atendimento de enfermagem",
               description = "Cria atendimento recebido do Ambulatorial ou UPA")
    @PostMapping
    @Audited(
        tipoOperacao = AuditLog.TipoOperacao.CREATE,
        entidadeTipo = "AtendimentoEnfermagem",
        descricao = "Criação de atendimento de enfermagem"
    )
    public ResponseEntity<AtendimentoEnfermagemDTO> criar(@Valid @RequestBody AtendimentoEnfermagemDTO dto) {
        AtendimentoEnfermagemDTO criado = atendimentoService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    @Operation(summary = "Buscar atendimento por ID")
    @GetMapping("/{id}")
    @Audited(
        tipoOperacao = AuditLog.TipoOperacao.READ,
        entidadeTipo = "AtendimentoEnfermagem",
        descricao = "Consulta de atendimento de enfermagem"
    )
    public ResponseEntity<AtendimentoEnfermagemDTO> buscarPorId(@PathVariable Long id) {
        AtendimentoEnfermagemDTO atendimento = atendimentoService.buscarPorId(id);
        return ResponseEntity.ok(atendimento);
    }

    @Operation(summary = "Iniciar atendimento",
               description = "Atribui enfermeiro e muda status para EM_ATENDIMENTO")
    @PutMapping("/{id}/iniciar")
    @Audited(
        tipoOperacao = AuditLog.TipoOperacao.UPDATE,
        entidadeTipo = "AtendimentoEnfermagem",
        descricao = "Início de atendimento de enfermagem"
    )
    public ResponseEntity<AtendimentoEnfermagemDTO> iniciar(
            @PathVariable Long id,
            @RequestParam Long enfermeiroId) {
        AtendimentoEnfermagemDTO atendimento = atendimentoService.iniciarAtendimento(id, enfermeiroId);
        return ResponseEntity.ok(atendimento);
    }

    @Operation(summary = "Registrar sinais vitais",
               description = "Registra PA, FC, FR, Temp, SatO2, Glicemia, Escala de Dor")
    @PutMapping("/{id}/sinais-vitais")
    @Audited(
        tipoOperacao = AuditLog.TipoOperacao.UPDATE,
        entidadeTipo = "AtendimentoEnfermagem",
        descricao = "Registro de sinais vitais"
    )
    public ResponseEntity<AtendimentoEnfermagemDTO> registrarSinaisVitais(
            @PathVariable Long id,
            @Valid @RequestBody AtendimentoEnfermagemDTO dto) {
        AtendimentoEnfermagemDTO atendimento = atendimentoService.registrarSinaisVitais(id, dto);
        return ResponseEntity.ok(atendimento);
    }

    @Operation(summary = "Finalizar atendimento",
               description = "Finaliza atendimento e registra observações finais")
    @PutMapping("/{id}/finalizar")
    @Audited(
        tipoOperacao = AuditLog.TipoOperacao.UPDATE,
        entidadeTipo = "AtendimentoEnfermagem",
        descricao = "Finalização de atendimento de enfermagem"
    )
    public ResponseEntity<AtendimentoEnfermagemDTO> finalizar(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String observacoes = body != null ? body.get("observacoes") : null;
        AtendimentoEnfermagemDTO atendimento = atendimentoService.finalizarAtendimento(id, observacoes);
        return ResponseEntity.ok(atendimento);
    }

    @Operation(summary = "Cancelar atendimento",
               description = "Cancela atendimento com motivo")
    @PutMapping("/{id}/cancelar")
    @Audited(
        tipoOperacao = AuditLog.TipoOperacao.UPDATE,
        entidadeTipo = "AtendimentoEnfermagem",
        descricao = "Cancelamento de atendimento de enfermagem"
    )
    public ResponseEntity<AtendimentoEnfermagemDTO> cancelar(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String motivo = body.get("motivo");
        AtendimentoEnfermagemDTO atendimento = atendimentoService.cancelarAtendimento(id, motivo);
        return ResponseEntity.ok(atendimento);
    }

    @Operation(summary = "Listar fila de atendimento",
               description = "Lista atendimentos aguardando ou em atendimento, ordenados por prioridade")
    @GetMapping("/fila")
    public ResponseEntity<List<AtendimentoEnfermagemDTO>> listarFila(@RequestParam Long unidadeId) {
        List<AtendimentoEnfermagemDTO> fila = atendimentoService.listarFilaAtendimento(unidadeId);
        return ResponseEntity.ok(fila);
    }

    @Operation(summary = "Listar atendimentos por unidade")
    @GetMapping("/unidade/{unidadeId}")
    public ResponseEntity<Page<AtendimentoEnfermagemDTO>> listarPorUnidade(
            @PathVariable Long unidadeId,
            @PageableDefault(size = 20, sort = "dataHoraInicio", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<AtendimentoEnfermagemDTO> page = atendimentoService.listarPorUnidade(unidadeId, pageable);
        return ResponseEntity.ok(page);
    }

    @Operation(summary = "Listar atendimentos por unidade e status")
    @GetMapping("/unidade/{unidadeId}/status/{status}")
    public ResponseEntity<Page<AtendimentoEnfermagemDTO>> listarPorUnidadeEStatus(
            @PathVariable Long unidadeId,
            @PathVariable StatusAtendimento status,
            @PageableDefault(size = 20, sort = "dataHoraInicio", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<AtendimentoEnfermagemDTO> page = atendimentoService.listarPorUnidadeEStatus(unidadeId, status, pageable);
        return ResponseEntity.ok(page);
    }

    @Operation(summary = "Listar atendimentos por paciente")
    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<Page<AtendimentoEnfermagemDTO>> listarPorPaciente(
            @PathVariable Long pacienteId,
            @PageableDefault(size = 20, sort = "dataHoraInicio", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<AtendimentoEnfermagemDTO> page = atendimentoService.listarPorPaciente(pacienteId, pageable);
        return ResponseEntity.ok(page);
    }

    @Operation(summary = "Contar atendimentos por unidade e status")
    @GetMapping("/unidade/{unidadeId}/status/{status}/count")
    public ResponseEntity<Long> contarPorUnidadeEStatus(
            @PathVariable Long unidadeId,
            @PathVariable StatusAtendimento status) {
        Long count = atendimentoService.contarPorUnidadeEStatus(unidadeId, status);
        return ResponseEntity.ok(count);
    }
}
