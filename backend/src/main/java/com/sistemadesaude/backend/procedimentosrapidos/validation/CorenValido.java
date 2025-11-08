package com.sistemadesaude.backend.procedimentosrapidos.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Anotação customizada para validar COREN
 * Formato esperado: COREN-UF-NNNNNN
 * Exemplo: COREN-SP-123456
 */
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = CorenValidator.class)
@Documented
public @interface CorenValido {
    
    String message() default "COREN inválido. Formato esperado: COREN-UF-NNNNNN";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
}