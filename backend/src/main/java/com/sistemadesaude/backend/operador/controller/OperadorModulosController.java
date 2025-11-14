package com.sistemadesaude.backend.operador.controller;

import com.sistemadesaude.backend.operador.entity.OperadorModuloAcesso;
import com.sistemadesaude.backend.operador.entity.OperadorModuloUnidade;
import com.sistemadesaude.backend.operador.entity.key.OperadorModuloKey;
import com.sistemadesaude.backend.operador.entity.key.OperadorModuloUnidadeKey;
import com.sistemadesaude.backend.operador.repository.OperadorModuloAcessoRepository;
import com.sistemadesaude.backend.operador.repository.OperadorModuloUnidadeRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Aba "MÓDULOS" do Operador.
 *
 * Endpoints:
 *  - GET /api/operadores/{operadorId}/modulos
 *      → ["ESTOQUE","ATENDIMENTO",...]
 *
 *  - PUT /api/operadores/{operadorId}/modulos
 *      → { "modulos": ["ESTOQUE","ATENDIMENTO"] }  (substituição total)
 *
 * Implementação tipada (sem reflexão), compatível com:
 *  - Entidade: com.sistemadesaude.backend.operador.entity.OperadorModuloAcesso
 *  - Chave:    com.sistemadesaude.backend.operador.entity.key.OperadorModuloKey
 */
@RestController
@RequestMapping("/api/operadores/{operadorId}")
@RequiredArgsConstructor
public class OperadorModulosController {

    private final OperadorModuloAcessoRepository repo;
    private final OperadorModuloUnidadeRepository moduloUnidadeRepo;

    /* =======================
       GET: listar módulos
       ======================= */

    @GetMapping("/modulos")
    public ResponseEntity<Map<String, Object>> listar(@PathVariable Long operadorId) {
        // Fast path: só strings via query
        List<String> codigos = repo.findModulos(operadorId);

        // Fallback (se a query acima for ajustada e retornar vazio):
        if (codigos == null || codigos.isEmpty()) {
            var entidades = repo.findByIdOperadorId(operadorId);
            codigos = new ArrayList<>(entidades.size());
            for (OperadorModuloAcesso e : entidades) {
                if (e != null && e.getId() != null) {
                    String m = e.getId().getModulo();
                    if (m != null && !m.isBlank()) codigos.add(m);
                }
            }
        }

        // Busca unidades vinculadas a cada módulo
        Map<String, List<Long>> modulosUnidades = new HashMap<>();
        for (String modulo : codigos) {
            List<Long> unidades = moduloUnidadeRepo.findUnidadesByOperadorAndModulo(operadorId, modulo);
            if (unidades != null && !unidades.isEmpty()) {
                modulosUnidades.put(modulo, unidades);
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("modulos", codigos);
        response.put("modulosUnidades", modulosUnidades); // Módulos com unidades específicas

        return ResponseEntity.ok(response);
    }

    /* =======================
       PUT: salvar módulos (substituição total)
       ======================= */

    @PutMapping("/modulos")
    @Transactional
    public ResponseEntity<Void> salvar(@PathVariable Long operadorId, @RequestBody ModulosPayload payload) {
        // limpa vínculos atuais (JPQL no repository; funciona com EmbeddedId)
        repo.deleteByOperadorId(operadorId);

        if (payload == null || payload.getModulos() == null || payload.getModulos().isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        // recria vínculos tipados
        for (String modulo : payload.getModulos()) {
            if (modulo == null || modulo.isBlank()) continue;

            OperadorModuloKey key = new OperadorModuloKey();
            key.setOperadorId(operadorId);
            // Se no seu projeto o nome do campo for "codigo", use key.setCodigo(modulo);
            key.setModulo(modulo);

            OperadorModuloAcesso ent = new OperadorModuloAcesso();
            ent.setId(key);

            repo.save(ent);
        }

        return ResponseEntity.noContent().build();
    }

    /* =======================
       GET: listar unidades de um módulo específico
       ======================= */

    @GetMapping("/modulos/{modulo}/unidades")
    public ResponseEntity<List<Long>> listarUnidadesDoModulo(
            @PathVariable Long operadorId,
            @PathVariable String modulo) {
        List<Long> unidades = moduloUnidadeRepo.findUnidadesByOperadorAndModulo(operadorId, modulo);
        return ResponseEntity.ok(unidades != null ? unidades : new ArrayList<>());
    }

    /* =======================
       PUT: salvar unidades de um módulo específico
       ======================= */

    @PutMapping("/modulos/{modulo}/unidades")
    @Transactional
    public ResponseEntity<Void> salvarUnidadesDoModulo(
            @PathVariable Long operadorId,
            @PathVariable String modulo,
            @RequestBody UnidadesModuloPayload payload) {
        
        // Remove vínculos atuais do módulo
        moduloUnidadeRepo.deleteByOperadorIdAndModulo(operadorId, modulo);

        // Se não há unidades, remove todos os vínculos (módulo aparece em todas)
        if (payload == null || payload.getUnidadeIds() == null || payload.getUnidadeIds().isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        // Cria novos vínculos
        for (Long unidadeId : payload.getUnidadeIds()) {
            if (unidadeId == null) continue;

            OperadorModuloUnidadeKey key = new OperadorModuloUnidadeKey();
            key.setOperadorId(operadorId);
            key.setModulo(modulo);
            key.setUnidadeId(unidadeId);

            OperadorModuloUnidade ent = new OperadorModuloUnidade();
            ent.setId(key);

            moduloUnidadeRepo.save(ent);
        }

        return ResponseEntity.noContent().build();
    }

    /* ===== Payloads ===== */
    @Getter @Setter
    public static class ModulosPayload { private List<String> modulos; }
    
    @Getter @Setter
    public static class UnidadesModuloPayload { private List<Long> unidadeIds; }
}
