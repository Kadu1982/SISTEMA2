package com.sistemadesaude.backend.perfilacesso.controller;

import com.sistemadesaude.backend.response.ApiResponse;
import com.sistemadesaude.backend.perfilacesso.dto.PerfilDTO;
import com.sistemadesaude.backend.perfilacesso.service.PerfilService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller para gerenciamento de perfis de acesso
 * ✅ CORRIGIDO: PreAuthorize agora funciona porque UserDetailsImpl adiciona ROLE_ADMINISTRADOR_SISTEMA para admin.master
 */
@RestController
@RequestMapping("/api/perfis")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMINISTRADOR_SISTEMA')")
public class PerfilController {

    private final PerfilService perfilService;

    /**
     * ✅ NOVO: Lista os tipos de perfis disponíveis no sistema (valores do Enum Perfil)
     * Pode ser acessado sem autenticação para uso no frontend
     */
    @GetMapping("/tipos-disponiveis")
    @PreAuthorize("permitAll()")
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> tiposDisponiveis() {
        log.info("Requisição para listar tipos de perfis disponíveis");
        try {
            List<Map<String, String>> tipos = java.util.Arrays.stream(
                    com.sistemadesaude.backend.perfilacesso.entity.Perfil.values())
                    .map(perfil -> {
                        Map<String, String> map = new java.util.LinkedHashMap<>();
                        map.put("codigo", perfil.getCodigo());
                        map.put("descricao", perfil.getDescricao());
                        map.put("nivel", String.valueOf(perfil.getNivel()));
                        map.put("nome", perfil.name());
                        return map;
                    })
                    .collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Tipos de perfis listados com sucesso", tipos));
        } catch (Exception e) {
            log.error("❌ Erro ao listar tipos de perfis: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Erro ao listar tipos de perfis", null));
        }
    }

    @GetMapping("/busca")
    public ResponseEntity<?> buscar(@RequestParam(name = "termo", required = false) String termo) {
        List<PerfilDTO> resultados = perfilService.buscarPorTermo(termo);
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", resultados));
    }


    /**
     * Lista todos os perfis
     * @return Lista de perfis
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<PerfilDTO>>> listarTodos() {
        log.info("Requisição para listar todos os perfis");
        try {
            List<PerfilDTO> perfis = perfilService.listarTodos();
            log.info("Total de perfis encontrados: {}", perfis.size());
            if (perfis.isEmpty()) {
                log.warn("⚠️ Nenhum perfil encontrado no banco de dados");
            } else {
                log.info("Perfis encontrados: {}", perfis.stream().map(p -> p.getNome() + " (" + p.getTipo() + ")").collect(java.util.stream.Collectors.joining(", ")));
            }
            return ResponseEntity.ok(new ApiResponse<>(true, "Perfis listados com sucesso", perfis));
        } catch (Exception e) {
            log.error("❌ Erro ao listar perfis: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Erro interno do servidor: " + e.getMessage(), null));
        }
    }

    /**
     * Busca um perfil pelo ID
     * @param id ID do perfil
     * @return Perfil encontrado
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PerfilDTO>> buscarPorId(@PathVariable Long id) {
        log.info("Requisição para buscar perfil pelo ID: {}", id);
        return perfilService.buscarPorId(id)
                .map(perfil -> ResponseEntity.ok(new ApiResponse<>(true, "Perfil encontrado com sucesso", perfil)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, "Perfil não encontrado com o ID: " + id, null)));
    }

    /**
     * Busca um perfil pelo nome
     * @param nome Nome do perfil
     * @return Perfil encontrado
     */
    @GetMapping("/nome/{nome}")
    public ResponseEntity<ApiResponse<PerfilDTO>> buscarPorNome(@PathVariable String nome) {
        log.info("Requisição para buscar perfil pelo nome: {}", nome);
        return perfilService.buscarPorNome(nome)
                .map(perfil -> ResponseEntity.ok(new ApiResponse<>(true, "Perfil encontrado com sucesso", perfil)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, "Perfil não encontrado com o nome: " + nome, null)));
    }

    /**
     * Cria um novo perfil
     * @param perfilDTO Dados do perfil
     * @return Perfil criado
     */
    @PostMapping
    public ResponseEntity<ApiResponse<PerfilDTO>> criar(@Valid @RequestBody PerfilDTO perfilDTO) {
        log.info("Requisição para criar perfil: {}", perfilDTO.getNome());
        try {
            PerfilDTO perfilCriado = perfilService.criar(perfilDTO);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(true, "Perfil criado com sucesso", perfilCriado));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Atualiza um perfil existente
     * @param id ID do perfil
     * @param perfilDTO Novos dados do perfil
     * @return Perfil atualizado
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PerfilDTO>> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody PerfilDTO perfilDTO) {
        log.info("Requisição para atualizar perfil com ID: {}", id);
        try {
            PerfilDTO perfilAtualizado = perfilService.atualizar(id, perfilDTO);
            return ResponseEntity.ok(new ApiResponse<>(true, "Perfil atualizado com sucesso", perfilAtualizado));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Exclui um perfil
     * @param id ID do perfil
     * @return Resposta de sucesso ou erro
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> excluir(@PathVariable Long id) {
        log.info("Requisição para excluir perfil com ID: {}", id);
        try {
            perfilService.excluir(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Perfil excluído com sucesso", null));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Atribui permissões a um perfil
     * @param id ID do perfil
     * @param permissoes Lista de permissões
     * @return Perfil atualizado
     */
    @PatchMapping("/{id}/permissoes")
    public ResponseEntity<ApiResponse<PerfilDTO>> atribuirPermissoes(
            @PathVariable Long id,
            @RequestBody List<String> permissoes) {
        log.info("🛡️ Requisição para atribuir permissões ao perfil com ID: {} - Permissões: {}", id, permissoes);
        try {
            PerfilDTO perfilAtualizado = perfilService.atribuirPermissoes(id, permissoes);
            log.info("✅ Permissões atribuídas com sucesso ao perfil {}", id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Permissões atribuídas com sucesso", perfilAtualizado));
        } catch (EntityNotFoundException e) {
            log.warn("⚠️ Perfil não encontrado com ID: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            log.error("❌ Erro ao atribuir permissões ao perfil {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Erro ao atribuir permissões: " + e.getMessage(), null));
        }
    }

    /**
     * Lista todas as permissões disponíveis no sistema
     * @return Lista de permissões
     */
    @GetMapping("/permissoes")
    public ResponseEntity<ApiResponse<List<String>>> listarPermissoes() {
        log.info("Requisição para listar todas as permissões");
        List<String> permissoes = perfilService.listarPermissoes();
        return ResponseEntity.ok(new ApiResponse<>(true, "Permissões listadas com sucesso", permissoes));
    }
}
