package com.sistemadesaude.backend.procedimentosrapidos.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

/**
 * Anotação para validar pontuação da Escala EVA (0-10)
 */
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PontuacaoEVAValidator.class)
@Documented
public @interface PontuacaoEVAValida {
    String message() default "Pontuação da Escala EVA deve estar entre 0 e 10";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}