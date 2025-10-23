package com.sistemadesaude.backend.operador.controller;

import com.sistemadesaude.backend.operador.entity.OperadorLocalArmazenamento;
import com.sistemadesaude.backend.operador.entity.OperadorLocalArmazenamentoId;
import com.sistemadesaude.backend.operador.repository.OperadorLocalArmazenamentoRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller da aba "Locais de Armazenamento" do Operador.
 *
 * Endpoints:
 *  - GET /api/operadores/{operadorId}/locais-armazenamento
 *      → retorna lista de IDs de locais liberados para o operador
 *
 *  - PUT /api/operadores/{operadorId}/locais-armazenamento
 *      → substitui o conjunto de locais liberados pelo conteúdo enviado em JSON:
 *         { "localIds": [1,2,3] }
 *
 * Observações:
 *  - Mantém a lógica simples: apaga vínculos atuais e recria com os IDs enviados.
 *  - Não altera nenhuma outra parte do sistema; é um controller NOVO e isolado.
 *  - Requer o repositório OperadorLocalArmazenamentoRepository e as entidades
 *    OperadorLocalArmazenamento/OperadorLocalArmazenamentoId (criaremos em seguida, se ainda não existirem).
 */
@RestController
@RequestMapping("/api/operadores/{operadorId}")
@RequiredArgsConstructor
public class OperadorLocaisController {

    private static final Logger log = LoggerFactory.getLogger(OperadorLocaisController.class);

    private final OperadorLocalArmazenamentoRepository repo;

    /**
     * Lista os IDs de locais de armazenamento liberados para o operador.
     */
    @GetMapping("/locais-armazenamento")
    public ResponseEntity<List<Long>> listar(@PathVariable Long operadorId) {
        var ids = repo.listarLocaisPermitidos(operadorId);
        return ResponseEntity.ok(ids);
    }

    /**
     * Salva (substitui) a lista de locais de armazenamento liberados para o operador.
     * Body esperado:
     *   { "localIds": [10,20,30] }
     */
    @PutMapping("/locais-armazenamento")
    public ResponseEntity<Void> salvar(@PathVariable Long operadorId, @RequestBody LocaisPayload payload) {
        // Remove vínculos atuais
        repo.deleteByIdOperadorId(operadorId);

        // Se não veio payload ou lista vazia, não cria nada (permanece sem vínculos)
        if (payload == null || payload.getLocalIds() == null || payload.getLocalIds().isEmpty()) {
            log.debug("Operador {}: locais liberados esvaziados.", operadorId);
            return ResponseEntity.noContent().build();
        }

        // Cria novos vínculos (operadorId, localId)
        for (Long localId : payload.getLocalIds()) {
            if (localId == null) continue;
            var id = new OperadorLocalArmazenamentoId(operadorId, localId);
            var ent = OperadorLocalArmazenamento.builder().id(id).build();
            repo.save(ent);
        }

        return ResponseEntity.noContent().build();
    }

    /* ===== DTO interno simples para o PUT ===== */

    @Getter @Setter
    public static class LocaisPayload {
        private List<Long> localIds;
    }
}
