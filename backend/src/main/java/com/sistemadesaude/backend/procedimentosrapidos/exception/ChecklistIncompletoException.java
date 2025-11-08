package com.sistemadesaude.backend.procedimentosrapidos.exception;

import java.util.List;

/**
 * Exceção lançada quando checklist dos 5 certos está incompleto
 */
public class ChecklistIncompletoException extends RuntimeException {

    private final List<String> camposNaoValidados;

    public ChecklistIncompletoException(List<String> camposNaoValidados) {
        super("Checklist dos 5 Certos incompleto. Campos não validados: " + 
              String.join(", ", camposNaoValidados));
        this.camposNaoValidados = camposNaoValidados;
    }

    public List<String> getCamposNaoValidados() {
        return camposNaoValidados;
    }
}

