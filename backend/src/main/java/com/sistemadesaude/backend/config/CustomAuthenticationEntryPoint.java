package com.sistemadesaude.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sistemadesaude.backend.exception.ApiErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Ponto de entrada para autenticação - substitui o diálogo HTTP Basic
 */
@Component
@Slf4j
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public void commence(HttpServletRequest request, 
                        HttpServletResponse response,
                        AuthenticationException authException) throws IOException, ServletException {
        
        log.warn("❌ Falha na autenticação: {}", authException.getMessage());
        
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        
        com.sistemadesaude.backend.exception.ApiErrorResponse<?> errorResponse = 
            com.sistemadesaude.backend.exception.ApiErrorResponse.error(
                "Autenticação necessária. Token inválido ou expirado."
            );
        
        String jsonResponse = objectMapper.writeValueAsString(errorResponse);
        response.getWriter().write(jsonResponse);
    }
}

