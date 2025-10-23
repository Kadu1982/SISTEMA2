package com.sistemadesaude.backend.operador.controller;

import com.sistemadesaude.backend.operador.dto.LoginRequest;
import com.sistemadesaude.backend.operador.dto.LoginResponse;
import com.sistemadesaude.backend.operador.entity.Operador;
import com.sistemadesaude.backend.operador.repository.OperadorRepository;
import com.sistemadesaude.backend.operador.security.AcessoValidator;
import com.sistemadesaude.backend.operador.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService authenticationService;
    private final OperadorRepository operadorRepository;
    private final AcessoValidator acessoValidator;

    /** Autenticação por login/senha. */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
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
        List<Long> filtradas = acessoValidator.filtrarUnidadesPermitidas(op, candidatas);
        return ResponseEntity.ok(filtradas);
    }
}
