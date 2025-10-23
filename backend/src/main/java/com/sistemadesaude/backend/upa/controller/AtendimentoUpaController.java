package com.sistemadesaude.backend.upa.controller;

import com.sistemadesaude.backend.response.ApiResponse; // se não existir, eu troco
import com.sistemadesaude.backend.upa.dto.CriarAtendimentoUpaRequest;
import com.sistemadesaude.backend.upa.dto.DesfechoAtendimentoRequest;
import com.sistemadesaude.backend.upa.service.AtendimentoUpaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** Endpoints de ATENDIMENTO UPA. Base: /api/upa/atendimentos */
@RestController
@RequestMapping("/api/upa/atendimentos")
@RequiredArgsConstructor
@Slf4j
public class AtendimentoUpaController {

    private final AtendimentoUpaService service;

    /** Cria um atendimento médico a partir de uma TRIAGEM UPA. */
    @PostMapping
    public ResponseEntity<ApiResponse<Long>> salvar(@RequestBody CriarAtendimentoUpaRequest req) {
        Long id = service.salvar(req);
        return ResponseEntity.ok(new ApiResponse<>(true, "Atendimento registrado", id));
    }

    // ===== Desfechos rápidos =====
    @PostMapping("/{id}/liberar")
    public ResponseEntity<ApiResponse<Void>> liberar(@PathVariable Long id, @RequestBody(required = false) DesfechoAtendimentoRequest req) {
        service.liberarUsuario(id, req != null ? req.getObservacoes() : null);
        return ResponseEntity.ok(new ApiResponse<>(true, "Usuário liberado (FINALIZADO)", null));
    }

    @PostMapping("/{id}/observacao")
    public ResponseEntity<ApiResponse<Void>> observacao(@PathVariable Long id, @RequestBody DesfechoAtendimentoRequest req) {
        service.observacao(id, req.getSetorDestino(), req.getObservacoes());
        return ResponseEntity.ok(new ApiResponse<>(true, "Encaminhado para observação", null));
    }

    @PostMapping("/{id}/encaminhamento")
    public ResponseEntity<ApiResponse<Void>> encaminhamento(@PathVariable Long id, @RequestBody DesfechoAtendimentoRequest req) {
        service.encaminhamentoInterno(id, req.getSetorDestino(), req.getObservacoes());
        return ResponseEntity.ok(new ApiResponse<>(true, "Encaminhamento interno registrado", null));
    }

    @PostMapping("/{id}/reavaliacao")
    public ResponseEntity<ApiResponse<Void>> reavaliacao(@PathVariable Long id, @RequestBody(required = false) DesfechoAtendimentoRequest req) {
        Integer prazo = req != null ? req.getPrazoMinutos() : null;
        String obs = req != null ? req.getObservacoes() : null;
        service.reavaliacao(id, prazo, obs);
        return ResponseEntity.ok(new ApiResponse<>(true, "Reavaliação programada", null));
    }
}
