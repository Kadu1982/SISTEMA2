package com.sistemadesaude.backend.procedimentosrapidos.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validator para pontuação da Escala EVA
 */
public class PontuacaoEVAValidator implements ConstraintValidator<PontuacaoEVAValida, Integer> {
    
    @Override
    public boolean isValid(Integer pontuacao, ConstraintValidatorContext context) {
        if (pontuacao == null) {
            return false;
        }
        return pontuacao >= 0 && pontuacao <= 10;
    }
}