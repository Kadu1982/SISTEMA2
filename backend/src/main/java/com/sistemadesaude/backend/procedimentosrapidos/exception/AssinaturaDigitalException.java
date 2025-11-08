package com.sistemadesaude.backend.procedimentosrapidos.exception;

/**
 * Exceção lançada quando há erro no processo de assinatura digital
 */
public class AssinaturaDigitalException extends RuntimeException {

    public AssinaturaDigitalException(String message) {
        super(message);
    }

    public AssinaturaDigitalException(String message, Throwable cause) {
        super(message, cause);
    }
}

