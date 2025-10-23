package com.sistemadesaude.backend.exames.controller;

import com.sistemadesaude.backend.exames.dto.MaterialExameDTO;
import com.sistemadesaude.backend.exames.service.MaterialExameService;
import com.sistemadesaude.backend.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/laboratorio/materiais")
@RequiredArgsConstructor
public class MaterialExameController {

    private final MaterialExameService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MaterialExameDTO>>> listar() {
        List<MaterialExameDTO> materiais = service.listarTodos();
        return ResponseEntity.ok(ApiResponse.success(materiais));
    }

    @GetMapping("/ativos")
    public ResponseEntity<ApiResponse<List<MaterialExameDTO>>> listarAtivos() {
        List<MaterialExameDTO> materiais = service.listarAtivos();
        return ResponseEntity.ok(ApiResponse.success(materiais));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MaterialExameDTO>> buscarPorId(@PathVariable Long id) {
        MaterialExameDTO material = service.buscarPorId(id);
        return ResponseEntity.ok(ApiResponse.success(material));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MaterialExameDTO>> criar(@RequestBody MaterialExameDTO material) {
        MaterialExameDTO novoMaterial = service.criar(material);
        return ResponseEntity.ok(ApiResponse.success(novoMaterial, "Material criado com sucesso"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MaterialExameDTO>> atualizar(
            @PathVariable Long id,
            @RequestBody MaterialExameDTO material
    ) {
        MaterialExameDTO atualizado = service.atualizar(id, material);
        return ResponseEntity.ok(ApiResponse.success(atualizado, "Material atualizado com sucesso"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Material inativado com sucesso"));
    }
}