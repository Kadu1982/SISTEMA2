
package com.sistemadesaude.backend.farmacia.controller;

import com.sistemadesaude.backend.farmacia.dto.FarmaciaDTO;
import com.sistemadesaude.backend.farmacia.service.FarmaciaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/farmacias")
@RequiredArgsConstructor
public class FarmaciaController {

    private final FarmaciaService farmaciaService;

    @GetMapping
    public List<FarmaciaDTO> listarTodas() {
        return farmaciaService.listarTodas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<FarmaciaDTO> buscarPorId(@PathVariable Long id) {
        return farmaciaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<FarmaciaDTO> salvar(@RequestBody FarmaciaDTO dto) {
        return ResponseEntity.ok(farmaciaService.salvar(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        farmaciaService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
