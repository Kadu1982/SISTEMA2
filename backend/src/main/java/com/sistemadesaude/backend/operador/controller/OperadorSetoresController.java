package com.sistemadesaude.backend.operador.controller;

import com.sistemadesaude.backend.operador.entity.OperadorSetor;
import com.sistemadesaude.backend.operador.entity.key.OperadorSetorKey;
import com.sistemadesaude.backend.operador.repository.OperadorSetorRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Aba "SETORES" do Operador.
 *
 * Compatível com o seu repository baseado em ID composto:
 *  - listar:  repo.findByIdOperadorId(operadorId) → extrai id.setorId
 *  - limpar:  repo.findByIdOperadorId(...) + repo.deleteAll(...)
 *  - salvar:  repo.save(new OperadorSetor( new OperadorSetorKey(operadorId, setorId) ))
 *
 * Endpoints:
 *  - GET /api/operadores/{operadorId}/setores
 *  - PUT /api/operadores/{operadorId}/setores  { "setorIds": [101,102] }
 */
@RestController
@RequestMapping("/api/operadores/{operadorId}")
@RequiredArgsConstructor
public class OperadorSetoresController {

    private final OperadorSetorRepository repo;

    /* =======================
       GET: listar setores
       ======================= */
    @GetMapping("/setores")
    public ResponseEntity<List<Long>> listar(@PathVariable Long operadorId) {
        var entidades = repo.findByIdOperadorId(operadorId);
        List<Long> out = new ArrayList<>();
        if (entidades != null) {
            for (OperadorSetor os : entidades) {
                if (os != null && os.getId() != null && os.getId().getSetorId() != null) {
                    out.add(os.getId().getSetorId());
                }
            }
        }
        return ResponseEntity.ok(out);
    }

    /* =======================
       PUT: salvar setores (substituição total)
       ======================= */
    @PutMapping("/setores")
    @Transactional
    public ResponseEntity<Void> salvar(@PathVariable Long operadorId, @RequestBody SetoresPayload payload) {
        // limpa vínculos atuais (seu repo não tem deleteByOperadorId)
        var atuais = repo.findByIdOperadorId(operadorId);
        if (atuais != null && !atuais.isEmpty()) {
            repo.deleteAll(atuais);
        }

        if (payload == null || payload.getSetorIds() == null || payload.getSetorIds().isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        // recria vínculos
        for (Long setorId : payload.getSetorIds()) {
            if (setorId == null) continue;

            OperadorSetorKey key = new OperadorSetorKey();
            key.setOperadorId(operadorId);
            key.setSetorId(setorId);

            OperadorSetor ent = new OperadorSetor();
            ent.setId(key);

            repo.save(ent);
        }

        return ResponseEntity.noContent().build();
    }

    /* ===== Payload ===== */
    @Getter @Setter
    public static class SetoresPayload { private List<Long> setorIds; }
}
