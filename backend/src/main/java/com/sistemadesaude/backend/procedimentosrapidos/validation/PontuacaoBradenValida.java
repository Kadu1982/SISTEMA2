package com.sistemadesaude.backend.procedimentosrapidos.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

/**
 * Anotação para validar pontuação da Escala de Braden (6-23)
 */
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PontuacaoBradenValidator.class)
@Documented
public @interface PontuacaoBradenValida {
    String message() default "Pontuação da Escala de Braden deve estar entre 6 e 23";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}