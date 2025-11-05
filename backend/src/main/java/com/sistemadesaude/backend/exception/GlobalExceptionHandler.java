package com.sistemadesaude.backend.exception;

import com.sistemadesaude.backend.response.ApiResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.HashMap;
import java.util.Map;

/**
 * Handler global para tratamento centralizado de exceções.
 * Padroniza respostas de erro e adiciona logging adequado.
 */
@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Trata erros de validação Bean Validation (@Valid, @Validated)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        log.warn("Erro de validação: {}", errors);
        ApiResponse<Map<String, String>> response = new ApiResponse<>(false, "Erro de validação", errors);
        return ResponseEntity.badRequest().body(response);
    }

    /**
     * Trata ResourceNotFoundException (entidade não encontrada)
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFoundException(ResourceNotFoundException ex) {
        log.warn("Recurso não encontrado: {}", ex.getMessage());
        ApiResponse<Void> response = new ApiResponse<>(false, ex.getMessage(), null);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    /**
     * Trata EntityNotFoundException (JPA)
     */
    @ExceptionHandler(EntityNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseEntity<ApiResponse<Void>> handleEntityNotFoundException(EntityNotFoundException ex) {
        log.warn("Entidade não encontrada: {}", ex.getMessage());
        ApiResponse<Void> response = new ApiResponse<>(false, "Registro não encontrado", null);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    /**
     * Trata BusinessException (regras de negócio)
     */
    @ExceptionHandler(BusinessException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException ex) {
        log.warn("Erro de negócio: {}", ex.getMessage());
        ApiResponse<Void> response = new ApiResponse<>(false, ex.getMessage(), null);
        return ResponseEntity.badRequest().body(response);
    }

    /**
     * Trata AccessDeniedException (permissão negada)
     */
    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(AccessDeniedException ex) {
        log.warn("Acesso negado: {}", ex.getMessage());
        ApiResponse<Void> response = new ApiResponse<>(false, "Acesso negado", null);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    /**
     * Trata AuthenticationException (falha de autenticação)
     */
    @ExceptionHandler({AuthenticationException.class, BadCredentialsException.class})
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ResponseEntity<ApiResponse<Void>> handleAuthenticationException(AuthenticationException ex) {
        log.warn("Falha de autenticação: {}", ex.getMessage());
        ApiResponse<Void> response = new ApiResponse<>(false, "Credenciais inválidas", null);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    /**
     * Trata DataIntegrityViolationException (violação de integridade do banco)
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        log.error("Violação de integridade de dados: {}", ex.getMessage());

        String mensagem = "Erro ao processar operação. Verifique se não há dados duplicados ou dependências.";

        // Detectar tipo de violação
        if (ex.getMessage().contains("unique") || ex.getMessage().contains("duplicate")) {
            mensagem = "Registro duplicado. Este dado já existe no sistema.";
        } else if (ex.getMessage().contains("foreign key") || ex.getMessage().contains("fk_")) {
            mensagem = "Não é possível excluir. Existem registros dependentes.";
        }

        ApiResponse<Void> response = new ApiResponse<>(false, mensagem, null);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    /**
     * Trata MethodArgumentTypeMismatchException (tipo de argumento inválido)
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        log.warn("Tipo de argumento inválido: {} para parâmetro {}", ex.getValue(), ex.getName());
        String mensagem = String.format("Parâmetro '%s' inválido. Valor '%s' não é do tipo esperado.",
                ex.getName(), ex.getValue());
        ApiResponse<Void> response = new ApiResponse<>(false, mensagem, null);
        return ResponseEntity.badRequest().body(response);
    }

    /**
     * Trata IllegalArgumentException
     */
    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("Argumento ilegal: {}", ex.getMessage());
        ApiResponse<Void> response = new ApiResponse<>(false, ex.getMessage(), null);
        return ResponseEntity.badRequest().body(response);
    }

    /**
     * Trata qualquer RuntimeException não capturada
     */
    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseEntity<ApiResponse<Void>> handleRuntimeException(RuntimeException ex) {
        log.error("Erro não tratado: {}", ex.getMessage(), ex);
        ApiResponse<Void> response = new ApiResponse<>(false,
                "Erro interno do servidor. Por favor, contate o suporte.", null);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    /**
     * Trata qualquer Exception não capturada (fallback final)
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        log.error("Erro inesperado: {}", ex.getMessage(), ex);
        ApiResponse<Void> response = new ApiResponse<>(false,
                "Erro inesperado. Por favor, tente novamente mais tarde.", null);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
