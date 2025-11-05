package com.sistemadesaude.backend.exception;

import com.sistemadesaude.backend.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        ApiResponse<Map<String, String>> response = new ApiResponse<>(false, "Erro de validação", errors);
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<String>> handleIllegalArgumentException(IllegalArgumentException ex) {
        log.warn("⚠️ IllegalArgumentException: {}", ex.getMessage());
        ApiResponse<String> response = new ApiResponse<>(false, ex.getMessage(), null);
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<String>> handleRuntimeException(RuntimeException ex) {
        // Log detalhado do erro para debugging
        log.error("❌ RuntimeException capturada pelo GlobalExceptionHandler", ex);

        // Mensagem mais informativa
        String message = ex.getMessage() != null && !ex.getMessage().isBlank()
            ? ex.getMessage()
            : "Erro interno do servidor";

        ApiResponse<String> response = new ApiResponse<>(false, message, null);

        // Se a mensagem contém indicadores de erro de banco/servidor, retorna 500
        if (message.toLowerCase().contains("banco de dados") ||
            message.toLowerCase().contains("database") ||
            message.toLowerCase().contains("sql") ||
            message.toLowerCase().contains("hibernate") ||
            message.toLowerCase().contains("jpa")) {
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // Caso contrário, mantém 400
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<String>> handleGenericException(Exception ex) {
        log.error("❌ Exception não tratada capturada pelo GlobalExceptionHandler", ex);
        ApiResponse<String> response = new ApiResponse<>(false, "Erro interno do servidor", null);
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
