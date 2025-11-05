package com.sistemadesaude.backend.operador.service;

import com.sistemadesaude.backend.operador.dto.LoginRequest;
import com.sistemadesaude.backend.operador.dto.LoginResponse;
import com.sistemadesaude.backend.operador.dto.OperadorDTO;
import com.sistemadesaude.backend.operador.entity.Operador;
import com.sistemadesaude.backend.operador.mapper.OperadorMapper;
import com.sistemadesaude.backend.operador.repository.OperadorRepository;
import com.sistemadesaude.backend.operador.security.AcessoValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Autenticação de Operador:
 * 1) Autentica login/senha via AuthenticationManager.
 * 2) Carrega o Operador.
 * 3) ✅ Valida "Horários de Acesso" (Passo 2) ANTES de emitir o JWT.
 * 4) ✅ Checa Termo de Uso obrigatório (Passo 5) e sinaliza via flag "requiresTermAccept".
 * 5) Emite o JWT e retorna o DTO do Operador.
 */
@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final AuthenticationManager authenticationManager;
    private final OperadorRepository operadorRepository;
    private final OperadorMapper operadorMapper;
    private final JwtService jwtService;

    private final AcessoValidator acessoValidator;
    private final TermoUsoService termoUsoService;

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        // 1) Autentica login/senha (lança exception caso inválidos)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getLogin(), request.getSenha())
        );

        // 2) Carrega Operador por login
        Operador operador = operadorRepository.findByLogin(request.getLogin())
                .orElseThrow(() -> new UsernameNotFoundException("Operador não encontrado com o login: " + request.getLogin()));

        if (Boolean.FALSE.equals(operador.getAtivo())) {
            throw new DisabledException("Operador inativo: " + request.getLogin());
        }

        // 3) ✅ Valida Horários de Acesso no momento do login (Passo 2).
        acessoValidator.validarJanelaDeLogin(operador, LocalDateTime.now());

        // 4) ✅ Termo de Uso obrigatório (Passo 5) — gancho.
        boolean requiresTermAccept = termoUsoService.isTermoObrigatorioENaoAceito(operador);

        // 5) Emite JWT e monta DTO do operador
        String jwtToken = jwtService.gerarToken(operador);
        OperadorDTO operadorDTO = operadorMapper.toDTO(operador);

        // 6) Monta a resposta com a flag de aceite do termo (quando aplicável)
        return new LoginResponse(jwtToken, operadorDTO, requiresTermAccept);
    }
}
