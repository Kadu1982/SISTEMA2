package com.sistemadesaude.backend.exames.controller;

import com.sistemadesaude.backend.exames.dto.ExameDTO;
import com.sistemadesaude.backend.exames.service.ExameService;
import com.sistemadesaude.backend.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/laboratorio/exames")
@RequiredArgsConstructor
public class ExameController {

    private final ExameService exameService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ExameDTO>>> listar() {
        List<ExameDTO> exames = exameService.listarTodos();
        return ResponseEntity.ok(ApiResponse.success(exames));
    }

    @GetMapping("/ativos")
    public ResponseEntity<ApiResponse<List<ExameDTO>>> listarAtivos() {
        List<ExameDTO> exames = exameService.listarAtivos();
        return ResponseEntity.ok(ApiResponse.success(exames));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ExameDTO>> buscarPorId(@PathVariable Long id) {
        ExameDTO exame = exameService.buscarPorId(id);
        return ResponseEntity.ok(ApiResponse.success(exame));
    }

    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<ApiResponse<ExameDTO>> buscarPorCodigo(@PathVariable String codigo) {
        ExameDTO exame = exameService.buscarPorCodigo(codigo);
        return ResponseEntity.ok(ApiResponse.success(exame));
    }

    @GetMapping("/buscar")
    public ResponseEntity<ApiResponse<List<ExameDTO>>> buscar(@RequestParam String termo) {
        List<ExameDTO> exames = exameService.buscar(termo);
        return ResponseEntity.ok(ApiResponse.success(exames));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ExameDTO>> criar(@RequestBody ExameDTO exame) {
        ExameDTO exameNovo = exameService.criar(exame);
        return ResponseEntity.ok(ApiResponse.success(exameNovo, "Exame criado com sucesso"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ExameDTO>> atualizar(
        @PathVariable Long id,
        @RequestBody ExameDTO exame
    ) {
        ExameDTO exameAtualizado = exameService.atualizar(id, exame);
        return ResponseEntity.ok(ApiResponse.success(exameAtualizado, "Exame atualizado com sucesso"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletar(@PathVariable Long id) {
        exameService.deletar(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Exame inativado com sucesso"));
    }
}