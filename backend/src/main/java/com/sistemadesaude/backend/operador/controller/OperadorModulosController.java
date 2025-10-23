package com.sistemadesaude.backend.operador.controller;

import com.sistemadesaude.backend.operador.entity.OperadorModuloAcesso;
import com.sistemadesaude.backend.operador.entity.key.OperadorModuloKey;
import com.sistemadesaude.backend.operador.repository.OperadorModuloAcessoRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

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

    /* =======================
       GET: listar módulos
       ======================= */

    @GetMapping("/modulos")
    public ResponseEntity<List<String>> listar(@PathVariable Long operadorId) {
        // Fast path: só strings via query
        List<String> codigos = repo.findModulos(operadorId);

        // Fallback (se a query acima for ajustada e retornar vazio):
        if (codigos == null || codigos.isEmpty()) {
            var entidades = repo.findByIdOperadorId(operadorId);
            codigos = new ArrayList<>(entidades.size());
            for (OperadorModuloAcesso e : entidades) {
                if (e != null && e.getId() != null) {
                    // Assumindo campo "modulo" no ID. Se for "codigo", troque abaixo:
                    String m = e.getId().getModulo();
                    if (m != null && !m.isBlank()) codigos.add(m);
                }
            }
        }

        return ResponseEntity.ok(codigos);
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

    /* ===== Payload ===== */
    @Getter @Setter
    public static class ModulosPayload { private List<String> modulos; }
}
