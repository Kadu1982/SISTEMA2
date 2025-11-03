package com.sistemadesaude.backend.operador.security;

import com.sistemadesaude.backend.operador.entity.Operador;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.lang.reflect.Method;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Implementação de UserDetails baseada na entidade Operador.
 * Mantém tudo tipado, com fallback por reflexão somente onde
 * os nomes de propriedades podem variar entre projetos (login/senha).
 */
public class UserDetailsImpl implements UserDetails {

    private final Operador operador;

    public UserDetailsImpl(Operador operador) {
        this.operador = Objects.requireNonNull(operador, "operador não pode ser nulo");
    }

    /** Exposto para serviços de segurança (ex.: pegar id/flags/perfis). */
    public Operador getOperador() {
        return operador;
    }

    /** Id do operador (atalho útil). */
    public Long getOperadorId() {
        return operador.getId();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // ✅ CORRIGIDO: Adiciona ROLE_ADMINISTRADOR_SISTEMA para admin.master (bypass)
        java.util.List<SimpleGrantedAuthority> authorities = new java.util.ArrayList<>();

        // Verifica se é admin.master (tem acesso total)
        try {
            String login = operador.getLogin();
            if ("admin.master".equalsIgnoreCase(login) || "admin".equalsIgnoreCase(login)) {
                // Admin master tem TODAS as permissões
                authorities.add(new SimpleGrantedAuthority("ROLE_ADMINISTRADOR_SISTEMA"));
                authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                authorities.add(new SimpleGrantedAuthority("ROLE_MASTER"));
            }
        } catch (Exception ignored) { }

        // Adiciona perfis do operador
        try {
            Object v = operador.getClass().getMethod("getPerfis").invoke(operador);
            if (v instanceof List<?> lista) {
                List<SimpleGrantedAuthority> perfilAuthorities = lista.stream()
                        .map(String::valueOf)
                        .filter(s -> !s.isBlank())
                        .map(s -> s.startsWith("ROLE_") ? s : "ROLE_" + s)
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());
                authorities.addAll(perfilAuthorities);
            }
        } catch (Exception ignored) { }

        return authorities.isEmpty() ? Collections.emptyList() : authorities;
    }

    @Override
    public String getPassword() {
        // Tenta getSenha(), depois getPassword()
        String s = tryGetString(operador, "getSenha", "getPassword");
        return s == null ? "" : s;
    }

    @Override
    public String getUsername() {
        // Ordens comuns de username em projetos: login → username → email → cpf → id
        String u = tryGetString(operador, "getLogin", "getUsername", "getEmail", "getCpf");
        if (u != null && !u.isBlank()) return u;
        return String.valueOf(operador.getId());
    }

    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }

    /* ===== Helpers ===== */

    private static String tryGetString(Object alvo, String... getters) {
        if (alvo == null || getters == null) return null;
        for (String g : getters) {
            try {
                Method m = alvo.getClass().getMethod(g);
                Object v = m.invoke(alvo);
                if (v != null) return String.valueOf(v);
            } catch (Exception ignored) { }
        }
        return null;
    }
}
