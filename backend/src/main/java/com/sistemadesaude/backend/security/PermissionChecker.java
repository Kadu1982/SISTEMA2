package com.sistemadesaude.backend.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Utilitário para verificar permissões e retornar informações detalhadas sobre o que está faltando
 */
public class PermissionChecker {

    /**
     * Analisa uma expressão @PreAuthorize e extrai as roles necessárias
     */
    public static Set<String> extractRequiredRoles(String preAuthorizeExpression) {
        Set<String> roles = new HashSet<>();
        
        if (preAuthorizeExpression == null || preAuthorizeExpression.trim().isEmpty()) {
            return roles;
        }
        
        // Padrão para hasAnyRole('ROLE1', 'ROLE2', ...)
        Pattern pattern = Pattern.compile("hasAnyRole\\(([^)]+)\\)");
        Matcher matcher = pattern.matcher(preAuthorizeExpression);
        
        if (matcher.find()) {
            String rolesString = matcher.group(1);
            // Remove aspas e espaços, divide por vírgula
            String[] roleArray = rolesString.split(",");
            for (String role : roleArray) {
                String cleaned = role.trim()
                    .replace("'", "")
                    .replace("\"", "")
                    .trim();
                // Adiciona ROLE_ se não tiver
                if (!cleaned.startsWith("ROLE_")) {
                    cleaned = "ROLE_" + cleaned;
                }
                roles.add(cleaned);
            }
        }
        
        // Se for isAuthenticated(), retorna vazio (qualquer autenticado)
        if (preAuthorizeExpression.contains("isAuthenticated()")) {
            return Collections.emptySet();
        }
        
        return roles;
    }

    /**
     * Obtém as roles do usuário atual
     */
    public static Set<String> getUserRoles(Authentication authentication) {
        if (authentication == null) {
            return Collections.emptySet();
        }
        
        return authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.toSet());
    }

    /**
     * Verifica quais roles estão faltando
     */
    public static Set<String> getMissingRoles(String preAuthorizeExpression, Authentication authentication) {
        Set<String> required = extractRequiredRoles(preAuthorizeExpression);
        
        // Se não há roles específicas necessárias (isAuthenticated), não falta nada
        if (required.isEmpty()) {
            return Collections.emptySet();
        }
        
        Set<String> userRoles = getUserRoles(authentication);
        
        // Retorna as roles que são necessárias mas o usuário não tem
        return required.stream()
            .filter(role -> !userRoles.contains(role))
            .collect(Collectors.toSet());
    }

    /**
     * Cria uma mensagem detalhada sobre permissões
     */
    public static Map<String, Object> createPermissionDetails(
            String preAuthorizeExpression,
            Authentication authentication) {
        
        Map<String, Object> details = new HashMap<>();
        
        Set<String> requiredRoles = extractRequiredRoles(preAuthorizeExpression);
        Set<String> userRoles = getUserRoles(authentication);
        Set<String> missingRoles = getMissingRoles(preAuthorizeExpression, authentication);
        
        details.put("requiredRoles", requiredRoles.stream()
            .map(role -> role.replace("ROLE_", ""))
            .sorted()
            .collect(Collectors.toList()));
        
        details.put("userRoles", userRoles.stream()
            .map(role -> role.replace("ROLE_", ""))
            .sorted()
            .collect(Collectors.toList()));
        
        details.put("missingRoles", missingRoles.stream()
            .map(role -> role.replace("ROLE_", ""))
            .sorted()
            .collect(Collectors.toList()));
        
        details.put("hasPermission", missingRoles.isEmpty());
        
        return details;
    }
}

