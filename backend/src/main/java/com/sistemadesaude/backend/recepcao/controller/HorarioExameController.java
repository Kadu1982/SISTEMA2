package com.sistemadesaude.backend.recepcao.controller;

import com.sistemadesaude.backend.recepcao.dto.HorarioExameDTO;
import com.sistemadesaude.backend.recepcao.service.HorarioExameService;
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
@RequestMapping("/api/horarios-exames")
@RequiredArgsConstructor
@Slf4j
public class HorarioExameController {

    private final HorarioExameService horarioExameService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<HorarioExameDTO>> listarTodos() {
        log.debug("GET /api/horarios-exames - Listar todos");
        try {
            List<HorarioExameDTO> horarios = horarioExameService.listarTodos();
            return ResponseEntity.ok(horarios);
        } catch (Exception e) {
            log.error("Erro ao listar horários: {}", e.getMessage(), e);
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/unidade/{unidadeId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<HorarioExameDTO>> listarPorUnidade(@PathVariable Long unidadeId) {
        log.debug("GET /api/horarios-exames/unidade/{}", unidadeId);
        try {
            List<HorarioExameDTO> horarios = horarioExameService.listarPorUnidade(unidadeId);
            return ResponseEntity.ok(horarios);
        } catch (Exception e) {
            log.error("Erro ao listar horários da unidade {}: {}", unidadeId, e.getMessage(), e);
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/profissional/{profissionalId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<HorarioExameDTO>> listarPorProfissional(@PathVariable Long profissionalId) {
        log.debug("GET /api/horarios-exames/profissional/{}", profissionalId);
        try {
            List<HorarioExameDTO> horarios = horarioExameService.listarPorProfissional(profissionalId);
            return ResponseEntity.ok(horarios);
        } catch (Exception e) {
            log.error("Erro ao listar horários do profissional {}: {}", profissionalId, e.getMessage(), e);
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/por-data")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<HorarioExameDTO>> listarPorData(
            @RequestParam Long unidadeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        log.debug("GET /api/horarios-exames/por-data?unidadeId={}&data={}", unidadeId, data);
        try {
            List<HorarioExameDTO> horarios = horarioExameService.listarPorData(unidadeId, data);
            return ResponseEntity.ok(horarios);
        } catch (Exception e) {
            log.error("Erro ao listar horários para {}: {}", data, e.getMessage(), e);
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<HorarioExameDTO> buscarPorId(@PathVariable Long id) {
        log.debug("GET /api/horarios-exames/{}", id);
        try {
            HorarioExameDTO horario = horarioExameService.buscarPorId(id);
            return ResponseEntity.ok(horario);
        } catch (Exception e) {
            log.error("Erro ao buscar horário {}: {}", id, e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RECEPCAO', 'ADMIN', 'GESTOR', 'MASTER', 'MASTER_USER', 'ADMINISTRADOR_SISTEMA', 'ADMINISTRADOR')")
    public ResponseEntity<HorarioExameDTO> criar(@Valid @RequestBody HorarioExameDTO dto) {
        log.info("POST /api/horarios-exames - Criar horário");
        try {
            HorarioExameDTO horario = horarioExameService.criar(dto);
            return ResponseEntity
                    .created(URI.create("/api/horarios-exames/" + horario.getId()))
                    .body(horario);
        } catch (IllegalArgumentException e) {
            log.warn("Validação falhou: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Erro ao criar horário: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPCAO', 'ADMIN', 'GESTOR', 'MASTER', 'MASTER_USER', 'ADMINISTRADOR_SISTEMA', 'ADMINISTRADOR')")
    public ResponseEntity<HorarioExameDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody HorarioExameDTO dto) {
        log.info("PUT /api/horarios-exames/{}", id);
        try {
            HorarioExameDTO horario = horarioExameService.atualizar(id, dto);
            return ResponseEntity.ok(horario);
        } catch (IllegalArgumentException e) {
            log.warn("Validação falhou: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Erro ao atualizar horário {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR', 'MASTER', 'MASTER_USER', 'ADMINISTRADOR_SISTEMA', 'ADMINISTRADOR')")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        log.info("DELETE /api/horarios-exames/{}", id);
        try {
            horarioExameService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Erro ao deletar horário {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PatchMapping("/{id}/ativar")
    @PreAuthorize("hasAnyRole('RECEPCAO', 'ADMIN', 'GESTOR', 'MASTER', 'MASTER_USER', 'ADMINISTRADOR_SISTEMA', 'ADMINISTRADOR')")
    public ResponseEntity<Void> ativar(@PathVariable Long id) {
        log.info("PATCH /api/horarios-exames/{}/ativar", id);
        try {
            horarioExameService.ativar(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Erro ao ativar horário {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}