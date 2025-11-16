package com.sistemadesaude.backend.operador.controller;

import com.sistemadesaude.backend.operador.dto.LoginRequest;
import com.sistemadesaude.backend.operador.dto.LoginResponse;
import com.sistemadesaude.backend.operador.entity.Operador;
import com.sistemadesaude.backend.operador.repository.OperadorRepository;
import com.sistemadesaude.backend.operador.security.AcessoValidator;
import com.sistemadesaude.backend.operador.service.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Endpoints de autenticação e utilidades de acesso.
 * - POST /api/auth/login
 * - POST /api/auth/unidades-permitidas
 *
 * Alterações:
 * • login(): agora usa authenticationService.login(request) (retorna token + operador + requiresTermAccept).
 * • unidadesPermitidas(): NOVO (Passo 8) — filtra IDs de unidades após o login.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationService authenticationService;
    private final OperadorRepository operadorRepository;
    
    @Autowired(required = false)
    private AcessoValidator acessoValidator;
    
    public AuthController(AuthenticationService authenticationService, OperadorRepository operadorRepository) {
        this.authenticationService = authenticationService;
        this.operadorRepository = operadorRepository;
    }

    /**
     * Autenticação por login/senha - aceita JSON.
     */
    @PostMapping(value = "/login", consumes = "application/json")
    public ResponseEntity<LoginResponse> loginJson(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authenticationService.login(request));
    }

    /**
     * Autenticação por login/senha - aceita form-urlencoded.
     */
    @PostMapping(value = "/login", consumes = "application/x-www-form-urlencoded")
    public ResponseEntity<LoginResponse> loginForm(
            @RequestParam String login,
            @RequestParam String senha) {
        LoginRequest request = new LoginRequest(login, senha);
        return ResponseEntity.ok(authenticationService.login(request));
    }

    /**
     * Passo 8 — filtra a lista de unidades candidatas, mantendo apenas as permitidas para o operador.
     * Exemplo: POST /api/auth/unidades-permitidas?operadorId=123
     * Body: [10,20,30]
     */
    @PostMapping("/unidades-permitidas")
    public ResponseEntity<List<Long>> unidadesPermitidas(
            @RequestParam Long operadorId,
            @RequestBody List<Long> candidatas
    ) {
        Operador op = operadorRepository.findById(operadorId).orElseThrow();
        if (acessoValidator == null) {
            // Se AcessoValidator não estiver disponível, retorna todas as unidades candidatas
            return ResponseEntity.ok(candidatas);
        }
        List<Long> filtradas = acessoValidator.filtrarUnidadesPermitidas(op, candidatas);
        return ResponseEntity.ok(filtradas);
    }
}
