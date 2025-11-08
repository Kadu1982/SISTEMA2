package com.sistemadesaude.backend.procedimentosrapidos.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

/**
 * Anotação para validar pontuação da Escala de Fugulin (13-37)
 */
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PontuacaoFugulinValidator.class)
@Documented
public @interface PontuacaoFugulinValida {
    String message() default "Pontuação da Escala de Fugulin deve estar entre 13 e 37";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}