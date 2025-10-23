package com.sistemadesaude.backend.upa.config;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UpaConfiguracaoService {

    private final UpaConfiguracaoRepository repo;

    /** Retorna a configuração atual (cria com defaults se não existir). */
    @Transactional
    public UpaConfiguracao getAtual() {
        return repo.findAll().stream().findFirst()
                .orElseGet(() -> repo.save(UpaConfiguracao.builder().build()));
    }

    @Transactional
    public UpaConfiguracao atualizar(UpaConfiguracao nova) {
        UpaConfiguracao atual = getAtual();
        atual.setExibirCidCompleta(Boolean.TRUE.equals(nova.getExibirCidCompleta()));
        atual.setSugerirEnderecoUPA(Boolean.TRUE.equals(nova.getSugerirEnderecoUPA()));
        atual.setUsarClassifRisco(Boolean.TRUE.equals(nova.getUsarClassifRisco()));
        atual.setProtocoloRiscoPadrao(nova.getProtocoloRiscoPadrao());
        return repo.save(atual);
    }
}
