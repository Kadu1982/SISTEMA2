package com.sistemadesaude.backend.auditoria;

import com.sistemadesaude.backend.operador.entity.Operador;
import com.sistemadesaude.backend.operador.repository.OperadorRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.After;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;

/**
 * Aspect de Auditoria CRUD:
 * - Intercepta automaticamente métodos mapeados como POST/PUT/DELETE
 *   em qualquer controller do pacote com.sistemadesaude.backend..controller..
 * - Salva um registro em audit_evento com: data/hora, operadorId (se resolver),
 *   entidade (deduzida da URL), operação (HTTP method), recurso (URI), payloadResumo e IP.
 *
 * Observações:
 * - Não exige anotações nos controllers; já funciona "plug-and-play".
 * - Para obter operadorId, usa o SecurityContext (login) e busca no OperadorRepository.
 * - Payload é um RESUMO seguro (nomes das classes dos args) para evitar vazamento.
 * - Requer a presença da tabela "audit_evento". Se ainda não existir, crie via Flyway.
 *
 * Dependências:
 * - spring-boot-starter-aop no pom.xml (AOP).
 */
@Aspect
@Component
@RequiredArgsConstructor
public class AuditoriaAspect {

    private static final Logger log = LoggerFactory.getLogger(AuditoriaAspect.class);

    private final AuditEventoRepository auditRepo;
    private final OperadorRepository operadorRepository;
    private final HttpServletRequest request;

    /* =========================
       Onde vamos interceptar?
       ========================= */

    /**
     * Todos os métodos de controllers do seu backend.
     * (ajuste o package base se necessário)
     */
    @Pointcut("execution(* com.sistemadesaude.backend..controller..*(..))")
    public void qualquerController() { }

    /** Métodos anotados com @PostMapping */
    @Pointcut("@annotation(org.springframework.web.bind.annotation.PostMapping)")
    public void postMapping() { }

    /** Métodos anotados com @PutMapping */
    @Pointcut("@annotation(org.springframework.web.bind.annotation.PutMapping)")
    public void putMapping() { }

    /** Métodos anotados com @DeleteMapping */
    @Pointcut("@annotation(org.springframework.web.bind.annotation.DeleteMapping)")
    public void deleteMapping() { }

    /**
     * Após a execução de qualquer POST/PUT/DELETE em controllers,
     * registramos a auditoria.
     */
    @After("qualquerController() && (postMapping() || putMapping() || deleteMapping())")
    public void aposCrud(JoinPoint jp) {
        try {
            salvarAuditoria(jp);
        } catch (Exception e) {
            // Nunca devemos quebrar o fluxo do endpoint por causa de auditoria
            log.warn("Falha ao registrar auditoria: {}", e.getMessage(), e);
        }
    }

    /* =========================
       Lógica de registro
       ========================= */

    private void salvarAuditoria(JoinPoint jp) {
        // Dados básicos do request
        String metodoHttp = request.getMethod();                 // POST/PUT/DELETE
        String recurso     = request.getRequestURI();            // ex.: /api/operadores/123
        String ip          = request.getRemoteAddr();

        // Descobre "entidade" de forma heurística pela URL (segmento após /api/)
        String entidade = deduzEntidadePorUri(recurso);

        // Operador (quem): resolvemos via SecurityContext → login → repository
        Long operadorId = resolverOperadorId();

        // Resumo do payload: nomes de classes dos 3 primeiros argumentos do método
        String payloadResumo = Arrays.stream(jp.getArgs())
                .limit(3)
                .map(arg -> arg == null ? "null" : arg.getClass().getSimpleName())
                .reduce((a, b) -> a + "," + b)
                .orElse("");

        // Monta e salva o evento
        AuditEvento ev = AuditEvento.builder()
                .dataHora(LocalDateTime.now())
                .operadorId(operadorId)
                .entidade(entidade)
                .operacao(normalizarOperacao(metodoHttp))
                .recurso(recurso)
                .payloadResumo(payloadResumo)
                .ip(ip)
                .build();

        auditRepo.save(ev);
    }

    /** Converte método HTTP em CREATE/UPDATE/DELETE */
    private String normalizarOperacao(String metodo) {
        if (metodo == null) return "UPDATE";
        return switch (metodo.toUpperCase()) {
            case "POST"   -> "CREATE";
            case "PUT"    -> "UPDATE";
            case "PATCH"  -> "UPDATE";
            case "DELETE" -> "DELETE";
            default       -> "UPDATE";
        };
    }

    /**
     * Heurística para obter a "entidade" a partir da URI:
     * - Pega o primeiro segmento após "/api/" e usa em UPPERCASE.
     *   /api/operadores/123    → OPERADORES
     *   /api/estoque/locais    → ESTOQUE
     */
    private String deduzEntidadePorUri(String uri) {
        if (uri == null || uri.isBlank()) return "DESCONHECIDO";
        String u = uri.startsWith("/") ? uri.substring(1) : uri;
        String[] segs = u.split("/");
        if (segs.length == 0) return "DESCONHECIDO";
        // tenta encontrar "api" e pegar o próximo
        for (int i = 0; i < segs.length; i++) {
            if ("api".equalsIgnoreCase(segs[i]) && i + 1 < segs.length) {
                return segs[i + 1].toUpperCase();
            }
        }
        // fallback: primeiro segmento
        return segs[0].toUpperCase();
    }

    /**
     * Resolve o ID do operador logado:
     * - Pega o login de Authentication (SecurityContext)
     * - Busca no OperadorRepository para obter o ID
     * Se não encontrar, retorna null (auditoria sem operadorId).
     */
    private Long resolverOperadorId() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null) return null;

            String login = auth.getName();
            if (login == null || login.isBlank()) return null;

            return operadorRepository.findByLogin(login)
                    .map(Operador::getId)
                    .orElse(null);
        } catch (Exception e) {
            log.debug("Não foi possível resolver operadorId do SecurityContext: {}", e.getMessage());
            return null;
        }
    }
}
