package com.sistemadesaude.backend.exames.controller;

import com.sistemadesaude.backend.exames.dto.CriarRecepcaoRequest;
import com.sistemadesaude.backend.exames.entity.RecepcaoExame;
import com.sistemadesaude.backend.exames.service.RecepcaoExameService;
import com.sistemadesaude.backend.operador.entity.Operador;
import com.sistemadesaude.backend.operador.security.UserDetailsImpl;
import com.sistemadesaude.backend.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/laboratorio/recepcao")
@RequiredArgsConstructor
public class RecepcaoExameController {

    private final RecepcaoExameService recepcaoService;

    @PostMapping
    public ResponseEntity<ApiResponse<RecepcaoExame>> criar(
        @RequestBody CriarRecepcaoRequest request,
        @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        Operador operador = userDetails.getOperador();
        RecepcaoExame recepcao = recepcaoService.criar(request, operador);
        return ResponseEntity.ok(ApiResponse.success(recepcao, "Recepção criada com sucesso"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RecepcaoExame>> buscarPorId(@PathVariable Long id) {
        RecepcaoExame recepcao = recepcaoService.buscarPorId(id);
        return ResponseEntity.ok(ApiResponse.success(recepcao));
    }

    @GetMapping("/numero/{numeroRecepcao}")
    public ResponseEntity<ApiResponse<RecepcaoExame>> buscarPorNumero(
        @PathVariable String numeroRecepcao
    ) {
        RecepcaoExame recepcao = recepcaoService.buscarPorNumero(numeroRecepcao);
        return ResponseEntity.ok(ApiResponse.success(recepcao));
    }

    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<ApiResponse<List<RecepcaoExame>>> listarPorPaciente(
        @PathVariable Long pacienteId
    ) {
        List<RecepcaoExame> recepcoes = recepcaoService.listarPorPaciente(pacienteId);
        return ResponseEntity.ok(ApiResponse.success(recepcoes));
    }

    @PutMapping("/{id}/cancelar")
    public ResponseEntity<ApiResponse<Void>> cancelar(
        @PathVariable Long id,
        @RequestParam String motivo
    ) {
        recepcaoService.cancelar(id, motivo);
        return ResponseEntity.ok(ApiResponse.success(null, "Recepção cancelada com sucesso"));
    }
}