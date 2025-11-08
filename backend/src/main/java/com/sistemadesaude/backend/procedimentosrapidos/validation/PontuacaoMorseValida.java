package com.sistemadesaude.backend.procedimentosrapidos.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

/**
 * Anotação para validar pontuação da Escala de Morse (0-125)
 */
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PontuacaoMorseValidator.class)
@Documented
public @interface PontuacaoMorseValida {
    String message() default "Pontuação da Escala de Morse deve estar entre 0 e 125";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}