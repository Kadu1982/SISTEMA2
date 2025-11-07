package com.sistemadesaude.backend.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Resposta padrão para todas as APIs
 * Garante consistência nas respostas
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ApiErrorResponse<T> {
    
    /**
     * Indica se a operação foi bem-sucedida
     */
    private boolean success;
    
    /**
     * Mensagem descritiva sobre o resultado
     */
    private String message;
    
    /**
     * Dados da resposta (pode ser null em caso de erro)
     */
    private T data;
    
    /**
     * Factory method para sucesso
     */
    public static <T> ApiErrorResponse<T> success(String message) {
        return new ApiErrorResponse<>(true, message, null);
    }
    
    /**
     * Factory method para sucesso com dados
     */
    public static <T> ApiErrorResponse<T> success(String message, T data) {
        return new ApiErrorResponse<>(true, message, data);
    }
    
    /**
     * Factory method para erro
     */
    public static <T> ApiErrorResponse<T> error(String message) {
        return new ApiErrorResponse<>(false, message, null);
    }
    
    /**
     * Factory method para erro com detalhes
     */
    public static <T> ApiErrorResponse<T> error(String message, T data) {
        return new ApiErrorResponse<>(false, message, data);
    }
}

