package com.sistemadesaude.backend.config;

import com.github.benmanes.caffeine.cache.Cache;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Interceptor para implementar Rate Limiting.
 * Limita requisições por IP para prevenir abusos.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitInterceptor implements HandlerInterceptor {

    private final Cache<String, Integer> rateLimitCache;
    private final Cache<String, Long> blockedCache;

    private static final int MAX_REQUESTS_PER_MINUTE = 100; // Limite de requisições
    private static final int BLOCK_THRESHOLD = 150; // Threshold para bloqueio

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {

        String clientIp = getClientIP(request);
        String endpoint = request.getRequestURI();

        // Verificar se IP está bloqueado
        if (blockedCache.getIfPresent(clientIp) != null) {
            log.warn("Requisição bloqueada - IP: {} - Endpoint: {}", clientIp, endpoint);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.getWriter().write("{\"error\": \"Too many requests. Please try again later.\"}");
            return false;
        }

        // Incrementar contador de requisições
        Integer requestCount = rateLimitCache.getIfPresent(clientIp);
        if (requestCount == null) {
            requestCount = 0;
        }
        requestCount++;
        rateLimitCache.put(clientIp, requestCount);

        // Verificar se excedeu o limite
        if (requestCount > MAX_REQUESTS_PER_MINUTE) {
            log.warn("Rate limit excedido - IP: {} - Requisições: {} - Endpoint: {}",
                    clientIp, requestCount, endpoint);

            // Se exceder muito, bloquear temporariamente
            if (requestCount > BLOCK_THRESHOLD) {
                blockedCache.put(clientIp, System.currentTimeMillis());
                log.error("IP bloqueado temporariamente - IP: {} - Requisições: {}",
                        clientIp, requestCount);
            }

            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setHeader("Retry-After", "60");
            response.getWriter().write("{\"error\": \"Rate limit exceeded. Try again in 1 minute.\"}");
            return false;
        }

        return true;
    }

    private String getClientIP(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
