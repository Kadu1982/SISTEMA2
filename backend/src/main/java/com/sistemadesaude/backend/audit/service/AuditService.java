package com.sistemadesaude.backend.audit.service;

import com.sistemadesaude.backend.audit.entity.AuditLog;
import com.sistemadesaude.backend.audit.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Serviço de auditoria para registrar operações críticas do sistema.
 * Conformidade com LGPD e requisitos de segurança.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    /**
     * Registra uma operação de auditoria de forma assíncrona.
     * Usa REQUIRES_NEW para garantir que o log seja salvo mesmo se a transação principal falhar.
     */
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrarOperacao(
            Long usuarioId,
            String usuarioNome,
            String usuarioCpf,
            AuditLog.TipoOperacao tipoOperacao,
            String entidadeTipo,
            Long entidadeId,
            String descricao,
            HttpServletRequest request,
            Boolean sucesso,
            String mensagemErro
    ) {
        try {
            AuditLog audit = AuditLog.builder()
                    .usuarioId(usuarioId)
                    .usuarioNome(usuarioNome)
                    .usuarioCpf(usuarioCpf)
                    .tipoOperacao(tipoOperacao)
                    .entidadeTipo(entidadeTipo)
                    .entidadeId(entidadeId)
                    .descricao(descricao)
                    .ipOrigem(getClientIP(request))
                    .userAgent(request.getHeader("User-Agent"))
                    .endpoint(request.getRequestURI())
                    .metodoHttp(request.getMethod())
                    .dataHora(LocalDateTime.now())
                    .sucesso(sucesso)
                    .mensagemErro(mensagemErro)
                    .build();

            auditLogRepository.save(audit);
        } catch (Exception e) {
            // Nunca falhar a operação principal por erro no log de auditoria
            log.error("Erro ao registrar auditoria: {}", e.getMessage(), e);
        }
    }

    /**
     * Registra acesso a dados sensíveis (ex: prontuários, exames).
     */
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrarAcessoDadosSensiveis(
            Long usuarioId,
            String usuarioNome,
            String entidadeTipo,
            Long entidadeId,
            String descricao,
            HttpServletRequest request
    ) {
        registrarOperacao(
                usuarioId,
                usuarioNome,
                null,
                AuditLog.TipoOperacao.ACESSO_DADOS_SENSIVEIS,
                entidadeTipo,
                entidadeId,
                descricao,
                request,
                true,
                null
        );
    }

    /**
     * Verifica tentativas recentes de login falhas para detectar possíveis ataques.
     */
    public Long verificarTentativasFalhas(Long usuarioId, int minutosAtras) {
        LocalDateTime dataLimite = LocalDateTime.now().minusMinutes(minutosAtras);
        return auditLogRepository.countFalhasAutenticacao(usuarioId, dataLimite);
    }

    /**
     * Extrai o IP real do cliente, considerando proxies.
     */
    private String getClientIP(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // Pega apenas o primeiro IP se houver múltiplos
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
