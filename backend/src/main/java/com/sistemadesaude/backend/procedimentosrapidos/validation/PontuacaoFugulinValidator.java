package com.sistemadesaude.backend.procedimentosrapidos.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validator para pontuação da Escala de Fugulin
 */
public class PontuacaoFugulinValidator implements ConstraintValidator<PontuacaoFugulinValida, Integer> {
    
    @Override
    public boolean isValid(Integer pontuacao, ConstraintValidatorContext context) {
        if (pontuacao == null) {
            return false;
        }
        return pontuacao >= 13 && pontuacao <= 37;
    }
}