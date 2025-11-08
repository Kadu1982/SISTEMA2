package com.sistemadesaude.backend.procedimentosrapidos.exception;

/**
 * Exceção lançada quando COREN é inválido
 */
public class CorenInvalidoException extends RuntimeException {

    public CorenInvalidoException(String coren) {
        super("COREN inválido: " + coren + ". Formato esperado: COREN-UF-NNNNNN");
    }

    public CorenInvalidoException(String message, Throwable cause) {
        super(message, cause);
    }
}

