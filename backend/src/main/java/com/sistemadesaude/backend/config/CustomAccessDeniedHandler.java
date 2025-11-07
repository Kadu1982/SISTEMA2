package com.sistemadesaude.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sistemadesaude.backend.exception.ApiErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Handler de acesso negado - fornece feedback de permissões ao usuário
 */
@Component
@Slf4j
public class CustomAccessDeniedHandler implements AccessDeniedHandler {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public void handle(HttpServletRequest request, 
                      HttpServletResponse response,
                      AccessDeniedException accessDeniedException) throws IOException, ServletException {
        
        log.warn("🔐 Acesso negado: {}", accessDeniedException.getMessage());
        
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json;charset=UTF-8");
        
        // Coleta informações do usuário atual
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> details = new HashMap<>();
        
        if (auth != null) {
            List<String> userRoles = auth.getAuthorities().stream()
                .map(authority -> authority.getAuthority().replace("ROLE_", ""))
                .sorted()
                .collect(Collectors.toList());
            
            details.put("userRoles", userRoles);
            log.debug("Usuário {} com roles: {}", auth.getName(), userRoles);
        }
        
        ApiErrorResponse<?> errorResponse = ApiErrorResponse.error(
            "Acesso negado. Você não tem permissão para realizar esta ação.",
            details
        );
        
        String jsonResponse = objectMapper.writeValueAsString(errorResponse);
        response.getWriter().write(jsonResponse);
    }
}

