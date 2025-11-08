package com.sistemadesaude.backend.atendimento.controller;

import com.sistemadesaude.backend.atendimento.entity.Cid;
import com.sistemadesaude.backend.atendimento.service.CidService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cid10")
@RequiredArgsConstructor
@Slf4j
public class CidController {

    private final CidService cidService;

    @GetMapping("/buscar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Cid>> buscarCids(
            @RequestParam(required = false) String codigo,
            @RequestParam(required = false) String descricao,
            @RequestParam(required = false) String termo) {

        try {
            List<Cid> resultados;

            if (codigo != null && !codigo.trim().isEmpty()) {
                resultados = cidService.buscarPorCodigo(codigo.trim().toUpperCase());
            } else if (descricao != null && !descricao.trim().isEmpty()) {
                resultados = cidService.buscarPorDescricao(descricao.trim());
            } else if (termo != null && !termo.trim().isEmpty()) {
                resultados = cidService.buscarPorTermo(termo.trim());
            } else {
                return ResponseEntity.badRequest().build();
            }

            return ResponseEntity.ok(resultados);
        } catch (Exception e) {
            // Log do erro para debug
            System.err.println("Erro ao buscar CID: " + e.getMessage());
            e.printStackTrace();
            // Retorna lista vazia em caso de erro para não quebrar o frontend
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Cid> buscarPorId(@PathVariable Long id) {
        return cidService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<Cid>> listarCids(Pageable pageable) {
        Page<Cid> cids = cidService.listarTodos(pageable);
        return ResponseEntity.ok(cids);
    }
}
