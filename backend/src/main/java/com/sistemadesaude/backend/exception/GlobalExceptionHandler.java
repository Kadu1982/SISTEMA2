package com.sistemadesaude.backend.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.persistence.EntityNotFoundException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Handler global de exceções para toda a aplicação
 * Garante respostas padronizadas e logging centralizado
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Trata AccessDeniedException - Acesso negado (403)
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse<Map<String, Object>>> handleAccessDeniedException(
            AccessDeniedException ex) {
        
        log.warn("⚠️ AccessDeniedException: {}", ex.getMessage());
        
        Map<String, Object> details = new HashMap<>();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth != null) {
            List<String> userRoles = auth.getAuthorities().stream()
                .map(authority -> authority.getAuthority().replace("ROLE_", ""))
                .sorted()
                .collect(Collectors.toList());
            
            details.put("userRoles", userRoles);
            log.debug("Usuário com roles: {}", userRoles);
        } else {
            log.debug("Usuário não autenticado");
        }
        
        ApiErrorResponse<Map<String, Object>> response = new ApiErrorResponse<>(
            false,
            "Acesso negado. Verifique suas permissões.",
            details
        );
        
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    /**
     * Trata BadCredentialsException - Credenciais inválidas (401)
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiErrorResponse<?>> handleBadCredentialsException(
            BadCredentialsException ex) {
        
        log.warn("⚠️ Credenciais inválidas");
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(new ApiErrorResponse<>(
                false,
                "Email ou senha inválidos",
                null
            ));
    }

    /**
     * Trata MethodArgumentNotValidException - Validação falhou (400)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse<?>> handleValidationException(
            MethodArgumentNotValidException ex) {
        
        log.warn("⚠️ Erro de validação");
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> {
            String fieldName = error.getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
            log.debug("Campo '{}' com erro: {}", fieldName, errorMessage);
        });
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ApiErrorResponse<>(false, "Validação falhou", errors));
    }

    /**
     * Trata EntityNotFoundException - Recurso não encontrado (404)
     */
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiErrorResponse<?>> handleEntityNotFoundException(
            EntityNotFoundException ex) {
        
        log.warn("⚠️ Recurso não encontrado: {}", ex.getMessage());
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ApiErrorResponse<>(false, ex.getMessage(), null));
    }

    /**
     * Trata Exception genérica - Erro interno (500)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse<?>> handleGenericException(Exception ex) {
        
        log.error("❌ Erro não tratado", ex);
        
        String message = "Erro interno do servidor";
        if (ex.getMessage() != null && !ex.getMessage().isEmpty()) {
            message += ": " + ex.getMessage();
        }
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ApiErrorResponse<>(false, message, null));
    }
}
