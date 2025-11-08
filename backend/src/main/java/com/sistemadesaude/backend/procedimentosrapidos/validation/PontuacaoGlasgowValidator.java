package com.sistemadesaude.backend.procedimentosrapidos.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validator para pontuação da Escala de Glasgow
 */
public class PontuacaoGlasgowValidator implements ConstraintValidator<PontuacaoGlasgowValida, Integer> {
    
    @Override
    public boolean isValid(Integer pontuacao, ConstraintValidatorContext context) {
        if (pontuacao == null) {
            return false;
        }
        return pontuacao >= 3 && pontuacao <= 15;
    }
}