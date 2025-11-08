package com.sistemadesaude.backend.procedimentosrapidos.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validator para pontuação da Escala de Morse
 */
public class PontuacaoMorseValidator implements ConstraintValidator<PontuacaoMorseValida, Integer> {
    
    @Override
    public boolean isValid(Integer pontuacao, ConstraintValidatorContext context) {
        if (pontuacao == null) {
            return false;
        }
        return pontuacao >= 0 && pontuacao <= 125;
    }
}