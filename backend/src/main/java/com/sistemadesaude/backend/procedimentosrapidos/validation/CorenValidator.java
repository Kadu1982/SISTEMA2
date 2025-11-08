package com.sistemadesaude.backend.procedimentosrapidos.validation;

import com.sistemadesaude.backend.procedimentosrapidos.service.CorenValidationService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Validador customizado para COREN
 * Utiliza CorenValidationService para validação
 */
@Component
@RequiredArgsConstructor
public class CorenValidator implements ConstraintValidator<CorenValido, String> {

    private final CorenValidationService corenValidationService;

    @Override
    public void initialize(CorenValido constraintAnnotation) {
        ConstraintValidator.super.initialize(constraintAnnotation);
    }

    @Override
    public boolean isValid(String coren, ConstraintValidatorContext context) {
        if (coren == null || coren.trim().isEmpty()) {
            return false;
        }
        
        try {
            return corenValidationService.validar(coren);
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}