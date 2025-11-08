package com.sistemadesaude.backend.procedimentosrapidos.controller;

import com.sistemadesaude.backend.procedimentosrapidos.dto.*;
import com.sistemadesaude.backend.procedimentosrapidos.entity.AssinaturaDigital;
import com.sistemadesaude.backend.procedimentosrapidos.mapper.AssinaturaDigitalMapper;
import com.sistemadesaude.backend.procedimentosrapidos.service.AssinaturaAtividadeService;
import com.sistemadesaude.backend.procedimentosrapidos.service.AssinaturaDigitalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller para gerenciar assinaturas digitais
 * Endpoints para criar senha de assinatura e assinar atividades
 */
@RestController
@RequestMapping("/api/assinaturas-digitais")
@RequiredArgsConstructor
@Tag(name = "Assinatura Digital", description = "APIs para gerenciamento de assinaturas digitais")
public class AssinaturaDigitalController {

    private final AssinaturaDigitalService assinaturaDigitalService;
    private final AssinaturaAtividadeService assinaturaAtividadeService;
    private final AssinaturaDigitalMapper assinaturaMapper;

    /**
     * Criar ou atualizar senha de assinatura de um operador
     */
    @PostMapping("/senha-assinatura")
    @Operation(summary = "Criar/atualizar senha de assinatura", 
               description = "Cria ou atualiza a senha de assinatura de um operador (diferente da senha de login)")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Senha criada/atualizada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos")
    })
    public ResponseEntity<AssinaturaDigitalDTO> criarSenhaAssinatura(
            @Valid @RequestBody CriarSenhaAssinaturaRequestDTO request) {
        
        AssinaturaDigital assinatura;
        
        if (assinaturaDigitalService.temSenhaAssinaturaCadastrada(request.getOperadorId())) {
            // Atualizar senha existente
            assinatura = assinaturaDigitalService.atualizarSenhaAssinatura(
                    request.getOperadorId(), 
                    request.getSenhaAssinatura());
        } else {
            // Criar nova senha
            assinatura = assinaturaDigitalService.criarSenhaAssinatura(
                    request.getOperadorId(),
                    request.getSenhaAssinatura(),
                    request.getCoren());
        }
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(assinaturaMapper.toDTO(assinatura));
    }

    /**
     * Assinar uma atividade de enfermagem
     */
    @PostMapping("/atividades/{atividadeId}/assinar")
    @Operation(summary = "Assinar digitalmente uma atividade de enfermagem",
               description = "Assina uma atividade após validar senha de login + senha de assinatura + COREN + checklist")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Assinatura realizada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos"),
        @ApiResponse(responseCode = "401", description = "Senha incorreta"),
        @ApiResponse(responseCode = "403", description = "COREN inválido ou checklist incompleto"),
        @ApiResponse(responseCode = "404", description = "Atividade não encontrada")
    })
    public ResponseEntity<AssinaturaDigitalResponseDTO> assinarAtividade(
            @PathVariable Long atividadeId,
            @Valid @RequestBody AssinaturaDigitalRequestDTO request) {
        
        AssinaturaDigitalResponseDTO response = assinaturaAtividadeService
                .assinarAtividade(atividadeId, request);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Listar assinaturas de uma atividade
     */
    @GetMapping("/atividades/{atividadeId}")
    @Operation(summary = "Listar assinaturas de uma atividade",
               description = "Retorna todas as assinaturas de uma atividade específica")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso"),
        @ApiResponse(responseCode = "404", description = "Atividade não encontrada")
    })
    public ResponseEntity<List<AssinaturaDigitalDTO>> listarAssinaturasPorAtividade(
            @PathVariable Long atividadeId) {
        
        var assinatura = assinaturaDigitalService.buscarPorAtividade(atividadeId);
        
        return ResponseEntity.ok(
                assinatura.map(a -> List.of(assinaturaMapper.toDTO(a)))
                         .orElse(List.of())
        );
    }

    /**
     * Listar assinaturas de um operador
     */
    @GetMapping("/operadores/{operadorId}")
    @Operation(summary = "Listar assinaturas de um operador",
               description = "Retorna todas as assinaturas realizadas por um operador")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    })
    public ResponseEntity<AssinaturaDigitalDTO> buscarSenhaAssinaturaPorOperador(
            @PathVariable Long operadorId) {
        
        var assinatura = assinaturaDigitalService.buscarPorOperador(operadorId);
        
        return assinatura.map(a -> ResponseEntity.ok(assinaturaMapper.toDTO(a)))
                        .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Verificar se operador tem senha de assinatura cadastrada
     */
    @GetMapping("/operadores/{operadorId}/tem-senha")
    @Operation(summary = "Verificar se operador tem senha de assinatura",
               description = "Verifica se o operador já cadastrou uma senha de assinatura")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Verificação realizada com sucesso")
    })
    public ResponseEntity<Boolean> verificarSenhaAssinatura(
            @PathVariable Long operadorId) {
        
        boolean temSenha = assinaturaDigitalService.temSenhaAssinaturaCadastrada(operadorId);
        return ResponseEntity.ok(temSenha);
    }
}