package com.sistemadesaude.backend.upa.config;

import com.sistemadesaude.backend.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/upa/config")
@RequiredArgsConstructor
public class UpaConfiguracaoController {

    private final UpaConfiguracaoService service;

    @GetMapping
    public ResponseEntity<ApiResponse<UpaConfiguracao>> get() {
        var cfg = service.getAtual();
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", cfg));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<UpaConfiguracao>> put(@RequestBody UpaConfiguracao request) {
        var cfg = service.atualizar(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Atualizado", cfg));
    }
}
