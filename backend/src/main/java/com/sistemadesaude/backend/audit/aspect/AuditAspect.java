package com.sistemadesaude.backend.audit.aspect;

import com.sistemadesaude.backend.audit.annotation.Audited;
import com.sistemadesaude.backend.audit.service.AuditService;
import com.sistemadesaude.backend.operador.security.UserDetailsImpl;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Aspect que intercepta métodos anotados com @Audited e registra automaticamente
 * no sistema de auditoria.
 */
@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class AuditAspect {

    private final AuditService auditService;

    @Around("@annotation(com.sistemadesaude.backend.audit.annotation.Audited)")
    public Object auditarMetodo(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Audited audited = signature.getMethod().getAnnotation(Audited.class);

        HttpServletRequest request = getCurrentRequest();
        if (request == null) {
            log.warn("Request não disponível para auditoria");
            return joinPoint.proceed();
        }

        // Obter dados do usuário autenticado
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long usuarioId = null;
        String usuarioNome = "Sistema";
        String usuarioCpf = null;

        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl userDetails) {
            usuarioId = userDetails.getOperador().getId();
            usuarioNome = userDetails.getOperador().getNome();
            usuarioCpf = userDetails.getOperador().getCpf();
        }

        // Extrair ID da entidade dos argumentos (primeiro Long encontrado)
        Long entidadeId = extrairEntidadeId(joinPoint.getArgs());

        Boolean sucesso = true;
        String mensagemErro = null;

        try {
            Object result = joinPoint.proceed();
            return result;
        } catch (Exception e) {
            sucesso = false;
            mensagemErro = e.getMessage();

            if (audited.auditarErros()) {
                auditService.registrarOperacao(
                        usuarioId,
                        usuarioNome,
                        usuarioCpf,
                        audited.tipoOperacao(),
                        audited.entidadeTipo(),
                        entidadeId,
                        audited.descricao() + " (ERRO)",
                        request,
                        false,
                        mensagemErro
                );
            }

            throw e;
        } finally {
            if (sucesso) {
                auditService.registrarOperacao(
                        usuarioId,
                        usuarioNome,
                        usuarioCpf,
                        audited.tipoOperacao(),
                        audited.entidadeTipo(),
                        entidadeId,
                        audited.descricao(),
                        request,
                        true,
                        null
                );
            }
        }
    }

    private HttpServletRequest getCurrentRequest() {
        ServletRequestAttributes attributes =
            (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest() : null;
    }

    private Long extrairEntidadeId(Object[] args) {
        for (Object arg : args) {
            if (arg instanceof Long) {
                return (Long) arg;
            }
        }
        return null;
    }
}
