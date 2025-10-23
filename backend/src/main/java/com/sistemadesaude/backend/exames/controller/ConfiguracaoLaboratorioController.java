package com.sistemadesaude.backend.exames.controller;

import com.sistemadesaude.backend.exames.entity.ConfiguracaoLaboratorio;
import com.sistemadesaude.backend.exames.repository.ConfiguracaoLaboratorioRepository;
import com.sistemadesaude.backend.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/laboratorio/configuracao")
@RequiredArgsConstructor
public class ConfiguracaoLaboratorioController {

    private final ConfiguracaoLaboratorioRepository configuracaoRepository;

    @GetMapping("/unidade/{unidadeId}")
    public ResponseEntity<ApiResponse<ConfiguracaoLaboratorio>> buscarPorUnidade(
        @PathVariable Long unidadeId
    ) {
        ConfiguracaoLaboratorio config = configuracaoRepository
            .findByUnidadeId(unidadeId)
            .orElse(new ConfiguracaoLaboratorio());
        return ResponseEntity.ok(ApiResponse.success(config));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ConfiguracaoLaboratorio>> salvar(
        @RequestBody ConfiguracaoLaboratorio configuracao
    ) {
        ConfiguracaoLaboratorio config = configuracaoRepository.save(configuracao);
        return ResponseEntity.ok(ApiResponse.success(config, "Configuração salva com sucesso"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ConfiguracaoLaboratorio>> atualizar(
        @PathVariable Long id,
        @RequestBody ConfiguracaoLaboratorio configuracao
    ) {
        configuracao.setId(id);
        ConfiguracaoLaboratorio config = configuracaoRepository.save(configuracao);
        return ResponseEntity.ok(ApiResponse.success(config, "Configuração atualizada com sucesso"));
    }
}