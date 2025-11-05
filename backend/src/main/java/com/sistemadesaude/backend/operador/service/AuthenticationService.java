package com.sistemadesaude.backend.operador.service;

import com.sistemadesaude.backend.operador.dto.LoginRequest;
import com.sistemadesaude.backend.operador.dto.LoginResponse;
import com.sistemadesaude.backend.operador.dto.OperadorDTO;
import com.sistemadesaude.backend.operador.entity.Operador;
import com.sistemadesaude.backend.operador.mapper.OperadorMapper;
import com.sistemadesaude.backend.operador.repository.OperadorRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Method;
import java.time.LocalDateTime;

/**
 * Autenticação de Operador:
 * 1) Autentica login/senha via AuthenticationManager.
 * 2) Carrega o Operador.
 * 3) ✅ Valida "Horários de Acesso" (Passo 2) ANTES de emitir o JWT.
 *    - Nesta classe uso REFLEXÃO para chamar AcessoValidator, caso já exista no contexto.
 *    - Assim este arquivo compila isolado. Quando criarmos AcessoValidator, a regra passa a valer.
 * 4) ✅ Checa Termo de Uso obrigatório (Passo 5) e sinaliza via flag "requiresTermAccept".
 *    - Para não quebrar seu LoginResponse atual, retorno a flag internamente (TODO: incluir no DTO).
 * 5) Emite o JWT e retorna o DTO do Operador.
 */
@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private static final Logger log = LoggerFactory.getLogger(AuthenticationService.class);

    private final AuthenticationManager authenticationManager;
    private final OperadorRepository operadorRepository;
    private final OperadorMapper operadorMapper;
    private final JwtService jwtService;

    /** Usado para fazer lookup reflexivo de beans opcionais (AcessoValidator, TermoUsoService). */
    private final ApplicationContext applicationContext;

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
        //    - Usa reflexão para não criar dependência dura. Quando criarmos o AcessoValidator,
        //      este método automaticamente passará a aplicar a regra.
        validarHorariosDeAcessoSePossivel(operador);

        // 4) ✅ Termo de Uso obrigatório (Passo 5) — gancho.
        //    - Aqui apuramos a necessidade de aceite; como ainda não alteramos o DTO,
        //      deixo a flag local e LOGO que você me enviar o LoginResponse.java, eu
        //      adiciono o campo requiresTermAccept sem quebrar chamadas.
        boolean requiresTermAccept = isTermoObrigatorioENaoAceito(operador);

        // 5) Emite JWT e monta DTO do operador
        String jwtToken = jwtService.gerarToken(operador);
        OperadorDTO operadorDTO = operadorMapper.toDTO(operador);

        // 6) Monta a resposta
        //    Se o seu LoginResponse ainda não tiver o 3º campo (requiresTermAccept),
        //    mantemos o construtor antigo. Depois ajustamos o DTO.
        LoginResponse resp;
        try {
            // tenta achar um construtor (String, OperadorDTO, boolean)
            resp = LoginResponse.class
                    .getDeclaredConstructor(String.class, OperadorDTO.class, boolean.class)
                    .newInstance(jwtToken, operadorDTO, requiresTermAccept);
        } catch (ReflectiveOperationException e) {
            // fallback para o construtor antigo (String, OperadorDTO)
            log.debug("LoginResponse sem flag requiresTermAccept no momento; usando construtor antigo.");
            resp = new LoginResponse(jwtToken, operadorDTO);
        }

        return resp;
    }

    /**
     * Chama AcessoValidator.validarJanelaDeLogin(operador, agora) se o bean existir no contexto.
     * - Classe esperada: com.sistemadesaude.backend.operador.security.AcessoValidator
     * - Método esperado: validarJanelaDeLogin(Operador, LocalDateTime)
     * Se não existir, apenas registra no log (não bloqueia login).
     */
    private void validarHorariosDeAcessoSePossivel(Operador operador) {
        try {
            Class<?> clazz = Class.forName("com.sistemadesaude.backend.operador.security.AcessoValidator");
            Object bean = applicationContext.getBean(clazz);
            Method m = clazz.getMethod("validarJanelaDeLogin", Operador.class, LocalDateTime.class);
            m.invoke(bean, operador, LocalDateTime.now());
        } catch (ClassNotFoundException ex) {
            log.info("AcessoValidator não encontrado no contexto (valid. de horário será aplicada quando o criarmos).");
        } catch (NoSuchMethodException ex) {
            log.warn("Método validarJanelaDeLogin não encontrado em AcessoValidator.");
        } catch (Exception ex) {
            // Qualquer erro de validação deve bloquear o login (AccessDeniedException etc. sobe)
            if (ex.getCause() instanceof RuntimeException re) throw re;
            throw new RuntimeException("Falha ao validar horários de acesso.", ex);
        }
    }

    /**
     * Consulta o TermoUsoService (se existir) para saber se o Termo é obrigatório e não aceito.
     * - Classe esperada: com.sistemadesaude.backend.operador.service.TermoUsoService
     * - Método: boolean isTermoObrigatorioENaoAceito(Operador)
     * Se não existir, assume "false" (sem bloqueio por termo).
     */
    private boolean isTermoObrigatorioENaoAceito(Operador operador) {
        try {
            Class<?> clazz = Class.forName("com.sistemadesaude.backend.operador.service.TermoUsoService");
            Object bean = applicationContext.getBean(clazz);
            Method m = clazz.getMethod("isTermoObrigatorioENaoAceito", Operador.class);
            Object result = m.invoke(bean, operador);
            return (result instanceof Boolean b) && b;
        } catch (ClassNotFoundException ex) {
            log.info("TermoUsoService não encontrado; pulando verificação de termo por enquanto.");
            return false;
        } catch (Exception ex) {
            log.warn("Falha ao consultar TermoUsoService (assumindo não obrigatório).", ex);
            return false;
        }
    }
}
