package com.sistemadesaude.backend.operador.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * DTO de resposta do login.
 *
 * Campos:
 * - token: JWT emitido após autenticação bem-sucedida.
 * - operador: dados essenciais do operador logado (DTO).
 * - requiresTermAccept: (NOVO) indica se o sistema exige que o operador aceite o
 *   Termo de Uso vigente antes de liberar o acesso às demais telas.
 *
 * Retrocompatibilidade:
 * - Mantido construtor (String token, OperadorDTO operador) para chamadas antigas.
 * - Adicionado construtor (String token, OperadorDTO operador, boolean requiresTermAccept)
 *   para chamadas novas (ex.: AuthenticationService com verificação do termo).
 *
 * Observação:
 * - Caso você serialize este objeto para cache/filas, considere manter este layout estável
 *   ou versionar o DTO.
 */
@Data
@NoArgsConstructor
public class LoginResponse implements Serializable {
    private static final long serialVersionUID = 1L;

    private String token;
    private OperadorDTO operador;

    /**
     * (NOVO) Flag para informar ao frontend que o operador precisa aceitar
     * o Termo de Uso do Sistema ANTES de prosseguir.
     * Por padrão é false, garantindo comportamento anterior.
     */
    private boolean requiresTermAccept = false;

    /**
     * Construtor antigo (retrocompatível).
     * Mantém o comportamento anterior: requiresTermAccept permanece false.
     */
    public LoginResponse(String token, OperadorDTO operador) {
        this.token = token;
        this.operador = operador;
        this.requiresTermAccept = false;
    }

    /**
     * Construtor novo (com a flag requiresTermAccept).
     * Use quando o backend já tiver a verificação do Termo de Uso habilitada.
     */
    public LoginResponse(String token, OperadorDTO operador, boolean requiresTermAccept) {
        this.token = token;
        this.operador = operador;
        this.requiresTermAccept = requiresTermAccept;
    }
}
