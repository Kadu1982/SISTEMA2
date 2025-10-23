package com.sistemadesaude.backend.exames.controller;

import com.sistemadesaude.backend.exames.dto.GrupoExameDTO;
import com.sistemadesaude.backend.exames.service.GrupoExameService;
import com.sistemadesaude.backend.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/laboratorio/grupos")
@RequiredArgsConstructor
public class GrupoExameController {

    private final GrupoExameService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<GrupoExameDTO>>> listar() {
        List<GrupoExameDTO> grupos = service.listarTodos();
        return ResponseEntity.ok(ApiResponse.success(grupos));
    }

    @GetMapping("/ativos")
    public ResponseEntity<ApiResponse<List<GrupoExameDTO>>> listarAtivos() {
        List<GrupoExameDTO> grupos = service.listarAtivos();
        return ResponseEntity.ok(ApiResponse.success(grupos));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GrupoExameDTO>> buscarPorId(@PathVariable Long id) {
        GrupoExameDTO grupo = service.buscarPorId(id);
        return ResponseEntity.ok(ApiResponse.success(grupo));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GrupoExameDTO>> criar(@RequestBody GrupoExameDTO grupo) {
        GrupoExameDTO novoGrupo = service.criar(grupo);
        return ResponseEntity.ok(ApiResponse.success(novoGrupo, "Grupo criado com sucesso"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GrupoExameDTO>> atualizar(
            @PathVariable Long id,
            @RequestBody GrupoExameDTO grupo
    ) {
        GrupoExameDTO atualizado = service.atualizar(id, grupo);
        return ResponseEntity.ok(ApiResponse.success(atualizado, "Grupo atualizado com sucesso"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Grupo inativado com sucesso"));
    }
}