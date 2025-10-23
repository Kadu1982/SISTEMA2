package com.sistemadesaude.backend.recepcao.controller;

import com.sistemadesaude.backend.recepcao.dto.BloqueioHorarioDTO;
import com.sistemadesaude.backend.recepcao.service.BloqueioHorarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bloqueios-horarios")
@RequiredArgsConstructor
@Slf4j
public class BloqueioHorarioController {

    private final BloqueioHorarioService bloqueioHorarioService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BloqueioHorarioDTO>> listarTodos() {
        log.debug("GET /api/bloqueios-horarios - Listar todos");
        try {
            List<BloqueioHorarioDTO> bloqueios = bloqueioHorarioService.listarTodos();
            return ResponseEntity.ok(bloqueios);
        } catch (Exception e) {
            log.error("Erro ao listar bloqueios: {}", e.getMessage(), e);
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/unidade/{unidadeId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BloqueioHorarioDTO>> listarPorUnidade(@PathVariable Long unidadeId) {
        log.debug("GET /api/bloqueios-horarios/unidade/{}", unidadeId);
        try {
            List<BloqueioHorarioDTO> bloqueios = bloqueioHorarioService.listarPorUnidade(unidadeId);
            return ResponseEntity.ok(bloqueios);
        } catch (Exception e) {
            log.error("Erro ao listar bloqueios da unidade {}: {}", unidadeId, e.getMessage(), e);
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/por-data")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BloqueioHorarioDTO>> listarPorData(
            @RequestParam Long unidadeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        log.debug("GET /api/bloqueios-horarios/por-data?unidadeId={}&data={}", unidadeId, data);
        try {
            List<BloqueioHorarioDTO> bloqueios = bloqueioHorarioService.listarPorData(unidadeId, data);
            return ResponseEntity.ok(bloqueios);
        } catch (Exception e) {
            log.error("Erro ao listar bloqueios para {}: {}", data, e.getMessage(), e);
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/por-periodo")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BloqueioHorarioDTO>> listarPorPeriodo(
            @RequestParam Long unidadeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        log.debug("GET /api/bloqueios-horarios/por-periodo?inicio={}&fim={}", inicio, fim);
        try {
            List<BloqueioHorarioDTO> bloqueios = bloqueioHorarioService.listarPorPeriodo(unidadeId, inicio, fim);
            return ResponseEntity.ok(bloqueios);
        } catch (Exception e) {
            log.error("Erro ao listar bloqueios no período: {}", e.getMessage(), e);
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BloqueioHorarioDTO> buscarPorId(@PathVariable Long id) {
        log.debug("GET /api/bloqueios-horarios/{}", id);
        try {
            BloqueioHorarioDTO bloqueio = bloqueioHorarioService.buscarPorId(id);
            return ResponseEntity.ok(bloqueio);
        } catch (Exception e) {
            log.error("Erro ao buscar bloqueio {}: {}", id, e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RECEPCAO', 'ADMIN', 'GESTOR', 'MASTER', 'MASTER_USER', 'ADMINISTRADOR_SISTEMA', 'ADMINISTRADOR')")
    public ResponseEntity<BloqueioHorarioDTO> criar(@Valid @RequestBody BloqueioHorarioDTO dto) {
        log.info("POST /api/bloqueios-horarios - Criar bloqueio");
        try {
            BloqueioHorarioDTO bloqueio = bloqueioHorarioService.criar(dto);
            return ResponseEntity
                    .created(URI.create("/api/bloqueios-horarios/" + bloqueio.getId()))
                    .body(bloqueio);
        } catch (IllegalArgumentException e) {
            log.warn("Validação falhou: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Erro ao criar bloqueio: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPCAO', 'ADMIN', 'GESTOR', 'MASTER', 'MASTER_USER', 'ADMINISTRADOR_SISTEMA', 'ADMINISTRADOR')")
    public ResponseEntity<BloqueioHorarioDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody BloqueioHorarioDTO dto) {
        log.info("PUT /api/bloqueios-horarios/{}", id);
        try {
            BloqueioHorarioDTO bloqueio = bloqueioHorarioService.atualizar(id, dto);
            return ResponseEntity.ok(bloqueio);
        } catch (IllegalArgumentException e) {
            log.warn("Validação falhou: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Erro ao atualizar bloqueio {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR', 'MASTER', 'MASTER_USER', 'ADMINISTRADOR_SISTEMA', 'ADMINISTRADOR')")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        log.info("DELETE /api/bloqueios-horarios/{}", id);
        try {
            bloqueioHorarioService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Erro ao deletar bloqueio {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}