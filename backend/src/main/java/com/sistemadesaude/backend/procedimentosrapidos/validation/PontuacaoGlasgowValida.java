package com.sistemadesaude.backend.procedimentosrapidos.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

/**
 * Anotação para validar pontuação da Escala de Glasgow (3-15)
 */
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PontuacaoGlasgowValidator.class)
@Documented
public @interface PontuacaoGlasgowValida {
    String message() default "Pontuação da Escala de Glasgow deve estar entre 3 e 15";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}