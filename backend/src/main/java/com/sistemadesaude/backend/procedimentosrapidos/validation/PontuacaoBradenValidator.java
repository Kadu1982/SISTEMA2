package com.sistemadesaude.backend.procedimentosrapidos.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validator para pontuação da Escala de Braden
 */
public class PontuacaoBradenValidator implements ConstraintValidator<PontuacaoBradenValida, Integer> {
    
    @Override
    public boolean isValid(Integer pontuacao, ConstraintValidatorContext context) {
        if (pontuacao == null) {
            return false;
        }
        return pontuacao >= 6 && pontuacao <= 23;
    }
}