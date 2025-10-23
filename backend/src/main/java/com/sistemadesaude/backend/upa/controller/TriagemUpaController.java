package com.sistemadesaude.backend.upa.controller;

import com.sistemadesaude.backend.upa.dto.AguardandoTriagemDTO;
import com.sistemadesaude.backend.upa.dto.CriarTriagemUpaRequest;
import com.sistemadesaude.backend.upa.dto.TriadoDTO;
import com.sistemadesaude.backend.upa.service.TriagemUpaService;
import com.sistemadesaude.backend.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Endpoints de TRIAGEM (fluxo UPA sem agendamento).
 * Base: /api/upa/triagem
 */
@RestController
@RequestMapping("/api/upa/triagem")
@RequiredArgsConstructor
@Slf4j
public class TriagemUpaController {

    private final TriagemUpaService service;

    /** Lista ocorrências UPA ainda SEM triagem. */
    @GetMapping("/aguardando")
    public ResponseEntity<ApiResponse<List<AguardandoTriagemDTO>>> aguardando() {
        try {
            log.info("📋 GET /api/upa/triagem/aguardando");
            List<AguardandoTriagemDTO> data = service.listarAguardando();
            log.info("✅ Encontradas {} UPAs aguardando triagem", data.size());
            return ResponseEntity.ok(new ApiResponse<>(true, "Lista de aguardando triagem obtida", data));
        } catch (Exception e) {
            log.error("❌ Erro ao listar aguardando triagem", e);
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Erro ao listar aguardando triagem: " + e.getMessage(), null));
        }
    }

    /** Lista pacientes TRIADOS (triagem feita) e ainda SEM atendimento. */
    @GetMapping("/triados")
    public ResponseEntity<ApiResponse<List<TriadoDTO>>> triados() {
        try {
            log.info("📋 GET /api/upa/triagem/triados");
            List<TriadoDTO> data = service.listarTriadosSemAtendimento();
            log.info("✅ Encontrados {} triados sem atendimento", data.size());
            return ResponseEntity.ok(new ApiResponse<>(true, "Lista de triados obtida", data));
        } catch (Exception e) {
            log.error("❌ Erro ao listar triados", e);
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Erro ao listar triados: " + e.getMessage(), null));
        }
    }

    /** Cria a triagem para uma ocorrência UPA. */
    @PostMapping
    public ResponseEntity<ApiResponse<Long>> salvar(@RequestBody CriarTriagemUpaRequest req) {
        try {
            log.info("➕ POST /api/upa/triagem - Criando triagem: {}", req);
            Long id = service.salvarTriagem(req);
            log.info("✅ Triagem criada com ID: {}", id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Triagem criada com sucesso", id));
        } catch (Exception e) {
            log.error("❌ Erro ao criar triagem", e);
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Erro ao criar triagem: " + e.getMessage(), null));
        }
    }
}
