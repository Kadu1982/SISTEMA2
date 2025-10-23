package com.sistemadesaude.backend.samu.controller;

import com.sistemadesaude.backend.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Controller para atendimentos/regulação médica do SAMU
 * NOTA: Este controller retorna dados mockados para desenvolvimento.
 * A implementação completa com persistência será feita posteriormente.
 */
@RestController
@RequestMapping("/api/samu/atendimentos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AtendimentosSamuController {

    @GetMapping("/pendentes")
    @PreAuthorize("hasAnyRole('SAMU_REGULADOR', 'SAMU_OPERADOR', 'ADMIN', 'ADMINISTRADOR_DO_SISTEMA')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listarPendentes(
            @RequestParam(required = false) Long profissionalId) {

        List<Map<String, Object>> solicitacoes = new ArrayList<>();

        // Dados mockados para desenvolvimento
        Map<String, Object> sol1 = new HashMap<>();
        sol1.put("id", 1L);
        sol1.put("numeroProtocolo", "SAMU-2025-001");
        sol1.put("dataHora", LocalDateTime.now().minusHours(2));
        sol1.put("pacienteNome", "João Silva");
        sol1.put("pacienteIdade", 45);
        sol1.put("endereco", "Rua das Flores, 123 - Centro");
        sol1.put("tipoOcorrencia", "TRAUMA");
        sol1.put("prioridade", "ALTA");
        sol1.put("status", "PENDENTE_REGULACAO");
        sol1.put("descricao", "Paciente caiu de escada, suspeita de fratura");

        Map<String, Object> sol2 = new HashMap<>();
        sol2.put("id", 2L);
        sol2.put("numeroProtocolo", "SAMU-2025-002");
        sol2.put("dataHora", LocalDateTime.now().minusMinutes(30));
        sol2.put("pacienteNome", "Maria Santos");
        sol2.put("pacienteIdade", 67);
        sol2.put("endereco", "Av. Principal, 456 - Bairro Novo");
        sol2.put("tipoOcorrencia", "CLINICA");
        sol2.put("prioridade", "URGENTE");
        sol2.put("status", "PENDENTE_REGULACAO");
        sol2.put("descricao", "Dor torácica intensa, hipertensa");

        Map<String, Object> sol3 = new HashMap<>();
        sol3.put("id", 3L);
        sol3.put("numeroProtocolo", "SAMU-2025-003");
        sol3.put("dataHora", LocalDateTime.now().minusMinutes(15));
        sol3.put("pacienteNome", "Pedro Oliveira");
        sol3.put("pacienteIdade", 28);
        sol3.put("endereco", "Rua do Comércio, 789");
        sol3.put("tipoOcorrencia", "TRAUMA");
        sol3.put("prioridade", "EMERGENCIA");
        sol3.put("status", "PENDENTE_REGULACAO");
        sol3.put("descricao", "Acidente de moto, vítima inconsciente");

        solicitacoes.add(sol1);
        solicitacoes.add(sol2);
        solicitacoes.add(sol3);

        return ResponseEntity.ok(new ApiResponse<>(true, "Solicitações pendentes carregadas", solicitacoes));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SAMU_REGULADOR', 'ADMIN', 'ADMINISTRADOR_DO_SISTEMA')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> criarAtendimento(
            @RequestBody Map<String, Object> atendimento) {

        Map<String, Object> resultado = new HashMap<>(atendimento);
        resultado.put("id", new Random().nextLong(1000));
        resultado.put("dataHoraAtendimento", LocalDateTime.now());
        resultado.put("status", "EM_ATENDIMENTO");

        return ResponseEntity.ok(new ApiResponse<>(true, "Atendimento criado com sucesso", resultado));
    }

    @PutMapping("/{id}/encerrar")
    @PreAuthorize("hasAnyRole('SAMU_REGULADOR', 'ADMIN', 'ADMINISTRADOR_DO_SISTEMA')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> encerrarAtendimento(
            @PathVariable Long id) {

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("id", id);
        resultado.put("status", "ENCERRADO");
        resultado.put("dataHoraEncerramento", LocalDateTime.now());

        return ResponseEntity.ok(new ApiResponse<>(true, "Atendimento encerrado com sucesso", resultado));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SAMU_REGULADOR', 'SAMU_OPERADOR', 'ADMIN', 'ADMINISTRADOR_DO_SISTEMA')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> buscarAtendimento(
            @PathVariable Long id) {

        Map<String, Object> atendimento = new HashMap<>();
        atendimento.put("id", id);
        atendimento.put("numeroProtocolo", "SAMU-2025-" + String.format("%03d", id));
        atendimento.put("dataHora", LocalDateTime.now());
        atendimento.put("pacienteNome", "Paciente " + id);
        atendimento.put("status", "EM_ATENDIMENTO");

        return ResponseEntity.ok(new ApiResponse<>(true, "Atendimento encontrado", atendimento));
    }
}
