package com.sistemadesaude.backend.samu.controller;

import com.sistemadesaude.backend.response.ApiResponse;
import com.sistemadesaude.backend.samu.dto.ConfiguracaoSamuDTO;
import com.sistemadesaude.backend.samu.dto.ConfiguracaoSamuRequestDTO;
import com.sistemadesaude.backend.samu.service.ConfiguracaoSamuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controller para gerenciar Configurações do Módulo SAMU
 */
@Slf4j
@RestController
@RequestMapping("/api/samu/configuracoes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ConfiguracaoSamuController {

    private final ConfiguracaoSamuService configuracaoService;

    @GetMapping("/unidade/{unidadeId}")
    @PreAuthorize("hasAnyRole('SAMU_OPERADOR', 'SAMU_REGULADOR', 'ADMIN', 'ADMINISTRADOR_DO_SISTEMA')")
    public ResponseEntity<ApiResponse<ConfiguracaoSamuDTO>> buscarConfiguracao(@PathVariable Long unidadeId) {
        try {
            log.info("Buscando configuração SAMU para unidade: {}", unidadeId);

            // ✅ CORREÇÃO FINAL: Chamando o método que VOCÊ criou e que JÁ ESTÁ CORRETO.
            ConfiguracaoSamuDTO config = configuracaoService.buscarPorUnidade(unidadeId);

            ApiResponse<ConfiguracaoSamuDTO> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Configuração obtida com sucesso");
            response.setData(config);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao buscar configuração SAMU", e);


            ApiResponse<ConfiguracaoSamuDTO> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao buscar configuração: " + e.getMessage());


            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRADOR_DO_SISTEMA')")
    public ResponseEntity<ApiResponse<ConfiguracaoSamuDTO>> salvarConfiguracao(
            @Valid @RequestBody ConfiguracaoSamuRequestDTO request) {

        try {
            log.info("Salvando configuração SAMU para unidade: {}", request.getUnidadeId());

            ConfiguracaoSamuDTO saved = configuracaoService.salvarConfiguracao(request);

            ApiResponse<ConfiguracaoSamuDTO> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Configuração salva com sucesso");
            response.setData(saved);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao salvar configuração SAMU", e);

            ApiResponse<ConfiguracaoSamuDTO> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao salvar configuração: " + e.getMessage());

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @DeleteMapping("/unidade/{unidadeId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRADOR_DO_SISTEMA')")
    public ResponseEntity<ApiResponse<Void>> deletarConfiguracao(@PathVariable Long unidadeId) {
        try {
            log.info("Deletando configuração SAMU para unidade: {}", unidadeId);

            configuracaoService.deletarConfiguracao(unidadeId);

            ApiResponse<Void> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Configuração deletada com sucesso");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao deletar configuração SAMU", e);

            ApiResponse<Void> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao deletar configuração: " + e.getMessage());

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}