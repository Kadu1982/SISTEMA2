package com.sistemadesaude.backend.operador.controller;

import com.sistemadesaude.backend.operador.entity.OperadorUnidade;
import com.sistemadesaude.backend.operador.entity.key.OperadorUnidadeKey;
import com.sistemadesaude.backend.operador.repository.OperadorUnidadeRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

/**
 * Aba "UNIDADES" do Operador.
 *
 * ✅ Compatível com o seu Repository:
 *    - listar:  repo.findUnidadeIds(operadorId)  (rápido)  | fallback: repo.findByIdOperadorId(operadorId)
 *    - limpar:  repo.deleteByOperadorId(operadorId)
 *    - salvar:  repo.save(new OperadorUnidade(new OperadorUnidadeKey(operadorId, unidadeId)))
 *
 * 🛟 Extras preservados:
 *    - utilitários via reflexão (não são necessários no seu mapeamento, mas mantidos como fallback
 *      documentado para futuras mudanças). Estão no final do arquivo.
 */
@RestController
@RequestMapping("/api/operadores/{operadorId}")
@RequiredArgsConstructor
public class OperadorUnidadesController {

    private static final Logger log = LoggerFactory.getLogger(OperadorUnidadesController.class);

    private final OperadorUnidadeRepository repo;

    /* =======================
       GET: listar unidades
       ======================= */

    @GetMapping("/unidades")
    public ResponseEntity<List<Long>> listar(@PathVariable Long operadorId) {
        // Caminho “oficial” do seu repo: retorna só os IDs
        List<Long> ids = repo.findUnidadeIds(operadorId);

        // Fallback: se por algum motivo vier nulo/sem suporte, extraímos da entidade
        if (ids == null || ids.isEmpty()) {
            var entidades = repo.findByIdOperadorId(operadorId);
            ids = new ArrayList<>(entidades.size());
            for (OperadorUnidade ou : entidades) {
                if (ou != null && ou.getId() != null && ou.getId().getUnidadeId() != null) {
                    ids.add(ou.getId().getUnidadeId());
                } else {
                    // 🔙 fallback extremo (preservado): tenta refletir
                    Long id = extrairIdLong(ou, "getUnidadeId");
                    if (id == null) {
                        Object emb = invocar(ou, "getId");
                        if (emb != null) id = extrairIdLong(emb, "getUnidadeId");
                    }
                    if (id != null) ids.add(id);
                }
            }
        }
        return ResponseEntity.ok(ids);
    }

    /* =======================
       PUT: salvar unidades
       ======================= */

    @PutMapping("/unidades")
    @Transactional
    public ResponseEntity<Void> salvar(@PathVariable Long operadorId, @RequestBody UnidadesPayload payload) {
        // Apaga vínculos atuais (query específica do seu repo)
        repo.deleteByOperadorId(operadorId);

        // Nada para salvar? encerra
        if (payload == null || payload.getUnidadeIds() == null || payload.getUnidadeIds().isEmpty()) {
            log.info("Operador {}: unidades esvaziadas.", operadorId);
            return ResponseEntity.noContent().build();
        }

        // ✅ Caminho tipado (recomendado): cria a entidade real e salva
        for (Long unidadeId : payload.getUnidadeIds()) {
            if (unidadeId == null) continue;

            OperadorUnidadeKey key = new OperadorUnidadeKey();
            key.setOperadorId(operadorId);
            key.setUnidadeId(unidadeId);

            OperadorUnidade ent = new OperadorUnidade();
            ent.setId(key);

            repo.save(ent);
        }

        // 🛟 (opcional/documentado) Caminho com reflexão — desnecessário no seu caso,
        // mas preservado como referência técnica caso o mapeamento mude:
        // usarSalvarComReflexao(operadorId, payload.getUnidadeIds());

        return ResponseEntity.noContent().build();
    }

    /* ===== Payload ===== */
    @Getter @Setter
    public static class UnidadesPayload { private List<Long> unidadeIds; }

    /* =============================================================================
       🔽🔽🔽  Fallbacks/Utilitários preservados (não usados no seu fluxo atual) 🔽🔽🔽
       São mantidos apenas para fins de documentação e resiliência caso o mapeamento
       mude futuramente. Não há problema em mantê-los — não impactam o caminho principal.
       ============================================================================= */

    /** Exemplo de salvar usando reflexão (NÃO usado por padrão). */
    @SuppressWarnings("unused")
    private void usarSalvarComReflexao(Long operadorId, List<Long> unidadeIds) {
        try {
            // Instancia a entidade por nome (…repository.XRepository → …entity.X)
            String repoName = repo.getClass().getInterfaces()[0].getName();
            String simple   = repoName.substring(repoName.lastIndexOf('.') + 1).replace("Repository", "");
            String entityFqn= repoName.replace(".repository." + simple + "Repository", ".entity." + simple);

            Class<?> clazz = Class.forName(entityFqn);

            for (Long unidadeId : unidadeIds) {
                if (unidadeId == null) continue;

                Object ent = clazz.getDeclaredConstructor().newInstance();

                // tenta setar direto: setOperadorId / setUnidadeId
                boolean okOp = invocarComParametro(ent, "setOperadorId", Long.class, operadorId);
                boolean okUn = invocarComParametro(ent, "setUnidadeId", Long.class, unidadeId);

                // se for ID composto, popula no id e volta no setId
                if (!okOp || !okUn) {
                    Object id = invocar(ent, "getId");
                    if (id != null) {
                        boolean opSet = invocarComParametro(id, "setOperadorId", Long.class, operadorId);
                        boolean unSet = invocarComParametro(id, "setUnidadeId", Long.class, unidadeId);
                        if (opSet || unSet) invocarComParametro(ent, "setId", id.getClass(), id);
                    }
                }

                // save genérico
                // repo.save((OperadorUnidade) ent); // <— no seu repo, a entidade é conhecida
                // Se o cast não for possível, NÃO use reflexão no save. Prefira o caminho tipado.
            }
        } catch (Exception e) {
            log.warn("Salvar com reflexão falhou: {}", e.getMessage());
        }
    }

    /* ==== helpers de reflexão (preservados) ==== */

    private static Object invocar(Object alvo, String nome, Object... args) {
        try {
            Class<?>[] tipos = new Class<?>[args.length];
            for (int i = 0; i < args.length; i++) tipos[i] = args[i] != null ? args[i].getClass() : Object.class;
            Method m = alvo.getClass().getMethod(nome, tipos);
            return m.invoke(alvo, args);
        } catch (Exception e) { return null; }
    }

    private static boolean invocarComParametro(Object alvo, String nome, Class<?> tipo, Object valor) {
        try {
            Method m = alvo.getClass().getMethod(nome, tipo);
            m.invoke(alvo, valor);
            return true;
        } catch (Exception e) { return false; }
    }

    private static Long extrairIdLong(Object alvo, String getter) {
        if (alvo == null) return null;
        try {
            Method m = alvo.getClass().getMethod(getter);
            Object v = m.invoke(alvo);
            if (v == null) return null;
            if (v instanceof Number n) return n.longValue();
            return Long.valueOf(v.toString());
        } catch (Exception e) { return null; }
    }
}
