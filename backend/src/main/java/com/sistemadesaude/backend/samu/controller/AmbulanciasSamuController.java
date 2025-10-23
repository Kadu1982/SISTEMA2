package com.sistemadesaude.backend.samu.controller;

import com.sistemadesaude.backend.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Controller para solicitações de ambulâncias do SAMU
 * NOTA: Este controller retorna dados mockados para desenvolvimento.
 */
@RestController
@RequestMapping("/api/samu/ambulancias")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AmbulanciasSamuController {

    @GetMapping("/solicitacoes")
    @PreAuthorize("hasAnyRole('SAMU_REGULADOR', 'SAMU_OPERADOR', 'ADMIN', 'ADMINISTRADOR_DO_SISTEMA')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listarSolicitacoes(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long ambulanciaId) {

        List<Map<String, Object>> solicitacoes = new ArrayList<>();

        Map<String, Object> sol1 = new HashMap<>();
        sol1.put("id", 1L);
        sol1.put("ambulanciaId", 1L);
        sol1.put("ambulanciaNome", "USA 01");
        sol1.put("ambulanciaPlaca", "ABC-1234");
        sol1.put("ocorrenciaId", 1L);
        sol1.put("dataHoraSolicitacao", LocalDateTime.now().minusHours(1));
        sol1.put("status", "AGUARDANDO_CONFIRMACAO");
        sol1.put("destino", "Hospital Regional");

        Map<String, Object> sol2 = new HashMap<>();
        sol2.put("id", 2L);
        sol2.put("ambulanciaId", 2L);
        sol2.put("ambulanciaNome", "USB 01");
        sol2.put("ambulanciaPlaca", "DEF-5678");
        sol2.put("ocorrenciaId", 2L);
        sol2.put("dataHoraSolicitacao", LocalDateTime.now().minusMinutes(45));
        sol2.put("status", "EM_ROTA");
        sol2.put("destino", "UPA Norte");

        solicitacoes.add(sol1);
        solicitacoes.add(sol2);

        return ResponseEntity.ok(new ApiResponse<>(true, "Solicitações carregadas", solicitacoes));
    }

    @PostMapping("/solicitacoes")
    @PreAuthorize("hasAnyRole('SAMU_REGULADOR', 'ADMIN', 'ADMINISTRADOR_DO_SISTEMA')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> criarSolicitacao(
            @RequestBody Map<String, Object> solicitacao) {

        Map<String, Object> resultado = new HashMap<>(solicitacao);
        resultado.put("id", new Random().nextLong(1000));
        resultado.put("dataHoraSolicitacao", LocalDateTime.now());
        resultado.put("status", "AGUARDANDO_CONFIRMACAO");

        return ResponseEntity.ok(new ApiResponse<>(true, "Solicitação criada", resultado));
    }

    @PutMapping("/solicitacoes/{id}/encerrar")
    @PreAuthorize("hasAnyRole('SAMU_REGULADOR', 'ADMIN', 'ADMINISTRADOR_DO_SISTEMA')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> encerrarSolicitacao(
            @PathVariable Long id) {

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("id", id);
        resultado.put("status", "ENCERRADA");
        resultado.put("dataHoraEncerramento", LocalDateTime.now());

        return ResponseEntity.ok(new ApiResponse<>(true, "Solicitação encerrada", resultado));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SAMU_REGULADOR', 'SAMU_OPERADOR', 'ADMIN', 'ADMINISTRADOR_DO_SISTEMA')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listarAmbulanciaComStatus() {

        List<Map<String, Object>> ambulancias = new ArrayList<>();

        Map<String, Object> amb1 = new HashMap<>();
        amb1.put("id", 1L);
        amb1.put("nome", "USA 01");
        amb1.put("placa", "ABC-1234");
        amb1.put("tipo", "USA");
        amb1.put("status", "DISPONIVEL");
        amb1.put("localizacao", "Base Central");

        Map<String, Object> amb2 = new HashMap<>();
        amb2.put("id", 2L);
        amb2.put("nome", "USB 01");
        amb2.put("placa", "DEF-5678");
        amb2.put("tipo", "USB");
        amb2.put("status", "EM_OCORRENCIA");
        amb2.put("localizacao", "Av. Principal");

        ambulancias.add(amb1);
        ambulancias.add(amb2);

        return ResponseEntity.ok(new ApiResponse<>(true, "Ambulâncias carregadas", ambulancias));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SAMU_REGULADOR', 'SAMU_OPERADOR', 'ADMIN', 'ADMINISTRADOR_DO_SISTEMA')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> atualizarStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> dados) {

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("id", id);
        resultado.put("status", dados.get("status"));
        resultado.put("dataHoraAtualizacao", LocalDateTime.now());

        return ResponseEntity.ok(new ApiResponse<>(true, "Status atualizado", resultado));
    }
}
