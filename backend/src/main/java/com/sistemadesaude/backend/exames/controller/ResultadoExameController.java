package com.sistemadesaude.backend.exames.controller;

import com.sistemadesaude.backend.exames.dto.SalvarResultadoRequest;
import com.sistemadesaude.backend.exames.entity.ResultadoExame;
import com.sistemadesaude.backend.exames.service.ResultadoExameService;
import com.sistemadesaude.backend.operador.entity.Operador;
import com.sistemadesaude.backend.operador.security.UserDetailsImpl;
import com.sistemadesaude.backend.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/laboratorio/resultados")
@RequiredArgsConstructor
public class ResultadoExameController {

    private final ResultadoExameService resultadoService;

    @PostMapping
    public ResponseEntity<ApiResponse<ResultadoExame>> salvar(
        @RequestBody SalvarResultadoRequest request,
        @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        Operador operador = userDetails.getOperador();
        ResultadoExame resultado = resultadoService.salvar(request, operador);
        return ResponseEntity.ok(ApiResponse.success(resultado, "Resultado salvo com sucesso"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResultadoExame>> buscarPorId(@PathVariable Long id) {
        ResultadoExame resultado = resultadoService.buscarPorId(id);
        return ResponseEntity.ok(ApiResponse.success(resultado));
    }

    @GetMapping("/pendentes-assinatura")
    public ResponseEntity<ApiResponse<List<ResultadoExame>>> listarPendentesAssinatura() {
        List<ResultadoExame> resultados = resultadoService.listarPendentesAssinatura();
        return ResponseEntity.ok(ApiResponse.success(resultados));
    }

    @PutMapping("/{id}/assinar")
    public ResponseEntity<ApiResponse<Void>> assinar(
        @PathVariable Long id,
        @RequestParam Long profissionalId,
        @RequestParam(required = false) String assinaturaDigital
    ) {
        resultadoService.assinar(id, profissionalId, assinaturaDigital);
        return ResponseEntity.ok(ApiResponse.success(null, "Resultado assinado com sucesso"));
    }

    @GetMapping("/pendentes-digitacao")
    public ResponseEntity<ApiResponse<List<ResultadoExame>>> listarPendentesDigitacao(
            @RequestParam(required = false) Long unidadeId
    ) {
        List<ResultadoExame> resultados = resultadoService.listarPendentesDigitacao(unidadeId);
        return ResponseEntity.ok(ApiResponse.success(resultados));
    }
}