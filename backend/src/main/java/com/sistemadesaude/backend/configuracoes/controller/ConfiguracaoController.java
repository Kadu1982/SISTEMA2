package com.sistemadesaude.backend.configuracoes.controller;

import com.sistemadesaude.backend.response.ApiResponse;
import com.sistemadesaude.backend.configuracoes.dto.ConfiguracaoDTO;
import com.sistemadesaude.backend.configuracoes.service.ConfiguracaoService;
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
 * Controller para gerenciamento de configurações do sistema
 * Apenas usuários com perfil ADMINISTRADOR_SISTEMA ou admin.master podem acessar
 */
@RestController
@RequestMapping("/api/configuracoes")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMINISTRADOR_SISTEMA')")
public class ConfiguracaoController {

    private final ConfiguracaoService configuracaoService;

    /**
     * Lista todas as configurações
     * @return Lista de configurações
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ConfiguracaoDTO>>> listarTodas() {
        log.info("Requisição para listar todas as configurações");
        List<ConfiguracaoDTO> configuracoes = configuracaoService.listarTodas();
        return ResponseEntity.ok(new ApiResponse<>(true, "Configurações listadas com sucesso", configuracoes));
    }

    /**
     * Lista configurações por grupo
     * @param grupo Grupo de configurações
     * @return Lista de configurações do grupo
     */
    @GetMapping("/grupo/{grupo}")
    public ResponseEntity<ApiResponse<List<ConfiguracaoDTO>>> listarPorGrupo(@PathVariable String grupo) {
        log.info("Requisição para listar configurações do grupo: {}", grupo);
        List<ConfiguracaoDTO> configuracoes = configuracaoService.listarPorGrupo(grupo);
        return ResponseEntity.ok(new ApiResponse<>(true, "Configurações do grupo listadas com sucesso", configuracoes));
    }

    /**
     * Busca configurações por grupo como mapa
     * @param grupo Grupo de configurações
     * @return Mapa de configurações
     */
    @GetMapping("/grupo/{grupo}/mapa")
    public ResponseEntity<ApiResponse<Map<String, String>>> buscarMapaPorGrupo(@PathVariable String grupo) {
        log.info("Requisição para buscar mapa de configurações do grupo: {}", grupo);
        Map<String, String> mapa = configuracaoService.buscarMapaPorGrupo(grupo);
        return ResponseEntity.ok(new ApiResponse<>(true, "Mapa de configurações obtido com sucesso", mapa));
    }

    /**
     * Busca uma configuração pela chave
     * @param chave Chave da configuração
     * @return Configuração encontrada
     */
    @GetMapping("/{chave}")
    public ResponseEntity<ApiResponse<ConfiguracaoDTO>> buscarPorChave(@PathVariable String chave) {
        log.info("Requisição para buscar configuração pela chave: {}", chave);
        return configuracaoService.buscarPorChave(chave)
                .map(configuracao -> ResponseEntity.ok(new ApiResponse<>(true, "Configuração encontrada com sucesso", configuracao)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, "Configuração não encontrada com a chave: " + chave, null)));
    }

    /**
     * Salva uma configuração
     * @param configuracaoDTO Dados da configuração
     * @return Configuração salva
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ConfiguracaoDTO>> salvar(@Valid @RequestBody ConfiguracaoDTO configuracaoDTO) {
        log.info("Requisição para salvar configuração: {}", configuracaoDTO);
        ConfiguracaoDTO configuracaoSalva = configuracaoService.salvar(configuracaoDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Configuração salva com sucesso", configuracaoSalva));
    }

    /**
     * Salva múltiplas configurações
     * @param configuracoes Lista de configurações
     * @return Lista de configurações salvas
     */
    @PostMapping("/batch")
    public ResponseEntity<ApiResponse<List<ConfiguracaoDTO>>> salvarTodas(@Valid @RequestBody List<ConfiguracaoDTO> configuracoes) {
        log.info("Requisição para salvar {} configurações", configuracoes.size());
        List<ConfiguracaoDTO> configuracoesSalvas = configuracaoService.salvarTodas(configuracoes);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Configurações salvas com sucesso", configuracoesSalvas));
    }

    /**
     * Atualiza uma configuração
     * @param chave Chave da configuração
     * @param configuracaoDTO Novos dados da configuração
     * @return Configuração atualizada
     */
    @PutMapping("/{chave}")
    public ResponseEntity<ApiResponse<ConfiguracaoDTO>> atualizar(
            @PathVariable String chave,
            @Valid @RequestBody ConfiguracaoDTO configuracaoDTO) {
        log.info("Requisição para atualizar configuração com chave: {}", chave);
        try {
            ConfiguracaoDTO configuracaoAtualizada = configuracaoService.atualizar(chave, configuracaoDTO);
            return ResponseEntity.ok(new ApiResponse<>(true, "Configuração atualizada com sucesso", configuracaoAtualizada));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Exclui uma configuração
     * @param chave Chave da configuração
     * @return Resposta de sucesso ou erro
     */
    @DeleteMapping("/{chave}")
    public ResponseEntity<ApiResponse<Void>> excluir(@PathVariable String chave) {
        log.info("Requisição para excluir configuração com chave: {}", chave);
        try {
            configuracaoService.excluir(chave);
            return ResponseEntity.ok(new ApiResponse<>(true, "Configuração excluída com sucesso", null));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Lista todos os grupos distintos
     * @return Lista de grupos
     */
    @GetMapping("/grupos")
    public ResponseEntity<ApiResponse<List<String>>> listarGrupos() {
        log.info("Requisição para listar grupos de configurações");
        List<String> grupos = configuracaoService.listarGrupos();
        return ResponseEntity.ok(new ApiResponse<>(true, "Grupos listados com sucesso", grupos));
    }

    /**
     * Lista configurações editáveis
     * @return Lista de configurações editáveis
     */
    @GetMapping("/editaveis")
    public ResponseEntity<ApiResponse<List<ConfiguracaoDTO>>> listarEditaveis() {
        log.info("Requisição para listar configurações editáveis");
        List<ConfiguracaoDTO> configuracoes = configuracaoService.listarEditaveis();
        return ResponseEntity.ok(new ApiResponse<>(true, "Configurações editáveis listadas com sucesso", configuracoes));
    }

    /**
     * Lista configurações por grupo e editável
     * @param grupo Grupo de configurações
     * @param editavel Indica se é editável
     * @return Lista de configurações do grupo e editável
     */
    @GetMapping("/filtrar")
    public ResponseEntity<ApiResponse<List<ConfiguracaoDTO>>> listarPorGrupoEEditavel(
            @RequestParam(required = false) String grupo,
            @RequestParam(required = false) Boolean editavel) {
        log.info("Requisição para filtrar configurações - grupo: {}, editavel: {}", grupo, editavel);

        List<ConfiguracaoDTO> configuracoes;
        if (grupo != null && editavel != null) {
            configuracoes = configuracaoService.listarPorGrupoEEditavel(grupo, editavel);
        } else if (grupo != null) {
            configuracoes = configuracaoService.listarPorGrupo(grupo);
        } else if (editavel != null) {
            configuracoes = configuracaoService.listarEditaveis();
        } else {
            configuracoes = configuracaoService.listarTodas();
        }

        return ResponseEntity.ok(new ApiResponse<>(true, "Configurações filtradas com sucesso", configuracoes));
    }

    /**
     * Busca configurações por texto na chave
     * @param texto Texto a ser buscado na chave
     * @return Lista de configurações com chave contendo o texto
     */
    @GetMapping("/buscar")
    public ResponseEntity<ApiResponse<List<ConfiguracaoDTO>>> buscarPorChaveContendo(
            @RequestParam String texto) {
        log.info("Requisição para buscar configurações por texto: {}", texto);
        List<ConfiguracaoDTO> configuracoes = configuracaoService.buscarPorChaveContendo(texto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Configurações encontradas", configuracoes));
    }

    /**
     * Backup de todas as configurações
     * @return Todas as configurações para backup
     */
    @GetMapping("/backup")
    public ResponseEntity<ApiResponse<List<ConfiguracaoDTO>>> backup() {
        log.info("Requisição para backup de configurações");
        List<ConfiguracaoDTO> configuracoes = configuracaoService.listarTodas();
        return ResponseEntity.ok(new ApiResponse<>(true, "Backup de configurações realizado", configuracoes));
    }

    /**
     * Restore de configurações via backup
     * @param configuracoes Lista de configurações para restore
     * @return Lista de configurações restauradas
     */
    @PostMapping("/restore")
    public ResponseEntity<ApiResponse<List<ConfiguracaoDTO>>> restore(
            @Valid @RequestBody List<ConfiguracaoDTO> configuracoes) {
        log.info("Requisição para restore de {} configurações", configuracoes.size());
        try {
            List<ConfiguracaoDTO> configuracoesSalvas = configuracaoService.salvarTodas(configuracoes);
            return ResponseEntity.ok(new ApiResponse<>(true, "Configurações restauradas com sucesso", configuracoesSalvas));
        } catch (Exception e) {
            log.error("Erro ao fazer restore das configurações", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Erro ao restaurar configurações: " + e.getMessage(), null));
        }
    }
}
