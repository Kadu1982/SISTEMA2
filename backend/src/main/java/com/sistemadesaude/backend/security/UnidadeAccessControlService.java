package com.sistemadesaude.backend.security;

import com.sistemadesaude.backend.operador.entity.Operador;
import com.sistemadesaude.backend.operador.repository.OperadorRepository;
import com.sistemadesaude.backend.operador.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service para controle de acesso baseado na unidade do operador
 * ✅ Localizado em: security/ (junto com outros componentes de segurança)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UnidadeAccessControlService {

    private final OperadorRepository operadorRepository;

    /**
     * Retorna o operador logado
     */
    public Operador getOperadorLogado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl userDetails) {
            return userDetails.getOperador();
        }
        throw new RuntimeException("Operador não autenticado");
    }

    /**
     * Verifica se o operador tem acesso a uma unidade específica
     */
    public boolean temAcessoAUnidade(Long unidadeId) {
        if (unidadeId == null) return false;

        Operador operador = getOperadorLogado();
        boolean temAcesso = operador.temAcessoAUnidade(unidadeId);

        log.debug("Operador {} {} acesso à unidade {}",
                operador.getLogin(),
                temAcesso ? "TEM" : "NÃO TEM",
                unidadeId);

        return temAcesso;
    }

    /**
     * Retorna as unidades que o operador tem acesso
     * null = acesso a todas (master)
     */
    public List<Long> getUnidadesComAcesso() {
        Operador operador = getOperadorLogado();
        List<Long> unidades = operador.getUnidadesComAcesso();

        if (unidades == null) {
            log.debug("Operador {} é MASTER - acesso a todas as unidades", operador.getLogin());
        } else {
            log.debug("Operador {} tem acesso às unidades: {}", operador.getLogin(), unidades);
        }

        return unidades;
    }

    /**
     * Verifica se o operador é master
     */
    public boolean isMaster() {
        Operador operador = getOperadorLogado();
        return operador.isMasterUser();
    }

    /**
     * Aplica filtro de unidades em queries (para repositórios)
     * Retorna WHERE clause para adicionar nas consultas SQL
     */
    public String buildUnidadeFilter(String unidadeColumn) {
        if (isMaster()) {
            return ""; // Master vê tudo
        }

        List<Long> unidades = getUnidadesComAcesso();
        if (unidades == null || unidades.isEmpty()) {
            return " AND 1=0 "; // Não tem acesso a nada
        }

        String unidadesList = unidades.toString().replace("[", "").replace("]", "");
        return " AND " + unidadeColumn + " IN (" + unidadesList + ") ";
    }
}
