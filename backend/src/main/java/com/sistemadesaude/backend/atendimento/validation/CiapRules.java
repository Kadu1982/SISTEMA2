package com.sistemadesaude.backend.atendimento.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Target({ ElementType.TYPE })
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = CiapRulesValidator.class)
public @interface CiapRules {
    String message() default "Regras do CIAP violadas";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
