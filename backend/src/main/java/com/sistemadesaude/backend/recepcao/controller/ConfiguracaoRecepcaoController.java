package com.sistemadesaude.backend.recepcao.controller;

import com.sistemadesaude.backend.recepcao.entity.ConfiguracaoRecepcao;
import com.sistemadesaude.backend.recepcao.repository.ConfiguracaoRecepcaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/configuracoes/recepcao")
public class ConfiguracaoRecepcaoController {

    @Autowired
    private ConfiguracaoRecepcaoRepository repository;

    @GetMapping
    public List<ConfiguracaoRecepcao> listarTodas() {
        return repository.findAll();
    }

    @PostMapping
    public ConfiguracaoRecepcao salvar(@RequestBody ConfiguracaoRecepcao config) {
        return repository.save(config);
    }

    @PutMapping("/{id}")
    public ConfiguracaoRecepcao atualizar(@PathVariable Long id, @RequestBody ConfiguracaoRecepcao configAtualizada) {
        return repository.findById(id)
                .map(config -> {
                    config.setModoTotem(configAtualizada.isModoTotem());
                    config.setBiometriaObrigatoria(configAtualizada.isBiometriaObrigatoria());
                    config.setValidacaoDuplicatas(configAtualizada.isValidacaoDuplicatas());
                    config.setAlertaRecemNascidos(configAtualizada.isAlertaRecemNascidos());
                    config.setTempoSessao(configAtualizada.getTempoSessao());
                    config.setIdentificacaoEmergencia(configAtualizada.isIdentificacaoEmergencia());
                    return repository.save(config);
                })
                .orElseThrow(() -> new RuntimeException("Configuração não encontrada."));
    }
}
