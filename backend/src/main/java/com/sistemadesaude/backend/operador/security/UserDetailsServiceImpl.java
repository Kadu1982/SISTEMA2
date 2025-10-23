
package com.sistemadesaude.backend.operador.security;

import com.sistemadesaude.backend.operador.entity.Operador;
import com.sistemadesaude.backend.operador.repository.OperadorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final OperadorRepository operadorRepository;

    @Override
    public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException {
        Operador operador = operadorRepository.findByLogin(login)
                .orElseThrow(() -> new UsernameNotFoundException("Operador não encontrado: " + login));

        return new UserDetailsImpl(operador);
    }
}
