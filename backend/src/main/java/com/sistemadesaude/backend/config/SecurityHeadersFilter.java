package com.sistemadesaude.backend.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * ✅ SEGURANÇA: Filtro para adicionar headers de segurança HTTP
 * 
 * Este filtro adiciona headers de segurança em todas as respostas HTTP
 * para proteger contra vulnerabilidades comuns:
 * 
 * - X-Content-Type-Options: Previne MIME sniffing
 * - X-Frame-Options: Previne Clickjacking
 * - X-XSS-Protection: Ativa proteção XSS do navegador
 * - Strict-Transport-Security (HSTS): Força HTTPS em produção
 * - Referrer-Policy: Controla informações de referência
 * - Permissions-Policy: Controla acesso a APIs do navegador
 */
@Component
public class SecurityHeadersFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        // ✅ Previne MIME sniffing (força navegador a respeitar Content-Type)
        httpResponse.setHeader("X-Content-Type-Options", "nosniff");
        
        // ✅ Previne Clickjacking (impede que site seja embutido em iframe)
        httpResponse.setHeader("X-Frame-Options", "DENY");
        
        // ✅ Ativa proteção XSS do navegador
        httpResponse.setHeader("X-XSS-Protection", "1; mode=block");
        
        // ✅ HSTS: Força HTTPS por 1 ano (apenas em produção)
        // Remova o comentário abaixo quando implantar em HTTPS
        // httpResponse.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
        
        // ✅ Controla informações de referência (privacidade)
        httpResponse.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        
        // ✅ Permissions Policy: Desabilita APIs não utilizadas
        httpResponse.setHeader("Permissions-Policy", 
            "geolocation=(), microphone=(), camera=(), payment=(), usb=()");
        
        chain.doFilter(request, response);
    }
}

