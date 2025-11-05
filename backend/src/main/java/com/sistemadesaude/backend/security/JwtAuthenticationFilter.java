package com.sistemadesaude.backend.security;

import com.sistemadesaude.backend.operador.service.JwtService; // ✅ 1. Importa o novo JwtService
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtService jwtService; // ✅ 2. Injeta o novo JwtService

    @Autowired
    private UserDetailsService userDetailsService; // Injeta o UserDetailsService padrão do Spring

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        try {
            String path = request.getServletPath();
            String method = request.getMethod();

            logger.debug("🔍 Processando {} {}", method, path);

            // Endpoints públicos não precisam de token
            if (isPublicEndpoint(path)) {
                logger.debug("✅ Endpoint público, acesso permitido: {}", path);
                filterChain.doFilter(request, response);
                return;
            }

            String jwt = extractJwtFromRequest(request);

            if (jwt != null && jwtService.validateToken(jwt)) {
                String operadorLogin = jwtService.extractUsername(jwt);
                logger.debug("👤 Operador extraído do token: {}", operadorLogin);

                // Carrega UserDetails para verificar o usuário e obter authorities "oficiais"
                UserDetails userDetails = userDetailsService.loadUserByUsername(operadorLogin);

                // Validação extra: o token não só é válido, mas corresponde a um usuário existente
                if (operadorLogin != null && SecurityContextHolder.getContext().getAuthentication() == null && jwtService.isTokenValid(jwt, userDetails)) {

                    // Extrai as claims para checar se é master e obter roles
                    Claims claims = jwtService.extractAllClaims(jwt);
                    Boolean isMaster = claims.get("isMaster", Boolean.class);

                    logger.debug("👑 É master (claim): {}", isMaster);

                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    logger.info("✅ Operador '{}' autenticado com sucesso via JWT para {} {} com authorities: {}",
                            operadorLogin, method, path, userDetails.getAuthorities());
                } else {
                    logger.warn("❌ Token JWT válido, mas falha na validação contra UserDetails para o login: {}", operadorLogin);
                }
            } else {
                logger.warn("❌ Token JWT ausente, inválido ou expirado para a requisição: {} {}", method, path);
            }

            filterChain.doFilter(request, response);

        } catch (Exception e) {
            logger.error("💥 Erro fatal no filtro de autenticação JWT: {}", e.getMessage(), e);
            // Garante que a requisição continue mesmo em caso de erro inesperado no filtro
            filterChain.doFilter(request, response);
        }
    }

    private String extractJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    private boolean isPublicEndpoint(String path) {
        return path.startsWith("/api/auth") ||
                path.startsWith("/api/test") ||
                path.startsWith("/v3/api-docs") ||
                path.startsWith("/swagger-ui") ||
                path.startsWith("/api/health") ||
                path.startsWith("/actuator");
    }
}
