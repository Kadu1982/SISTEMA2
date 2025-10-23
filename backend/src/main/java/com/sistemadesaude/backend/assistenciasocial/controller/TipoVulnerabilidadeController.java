package com.sistemadesaude.backend.assistenciasocial.controller;

import com.sistemadesaude.backend.assistenciasocial.entity.TipoVulnerabilidade;
import com.sistemadesaude.backend.assistenciasocial.service.TipoVulnerabilidadeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * Controller para gerenciar os tipos de vulnerabilidade no módulo de Assistência Social.
 */
@RestController
@RequestMapping("/api/assistencia-social/tipos-vulnerabilidade")
public class TipoVulnerabilidadeController {

    private final TipoVulnerabilidadeService tipoVulnerabilidadeService;

    @Autowired
    public TipoVulnerabilidadeController(TipoVulnerabilidadeService tipoVulnerabilidadeService) {
        this.tipoVulnerabilidadeService = tipoVulnerabilidadeService;
    }

    /**
     * Busca todos os tipos de vulnerabilidade.
     * @return Lista de todos os tipos de vulnerabilidade.
     */
    @GetMapping
    public ResponseEntity<List<TipoVulnerabilidade>> buscarTodos() {
        return ResponseEntity.ok(tipoVulnerabilidadeService.buscarTodos());
    }

    /**
     * Busca todos os tipos de vulnerabilidade com paginação.
     * @param pageable Informações de paginação.
     * @return Página de tipos de vulnerabilidade.
     */
    @GetMapping("/paginado")
    public ResponseEntity<Page<TipoVulnerabilidade>> buscarTodosPaginado(Pageable pageable) {
        return ResponseEntity.ok(tipoVulnerabilidadeService.buscarTodos(pageable));
    }

    /**
     * Busca um tipo de vulnerabilidade pelo ID.
     * @param id ID do tipo de vulnerabilidade.
     * @return O tipo de vulnerabilidade encontrado.
     */
    @GetMapping("/{id}")
    public ResponseEntity<TipoVulnerabilidade> buscarPorId(@PathVariable Long id) {
        return tipoVulnerabilidadeService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tipo de vulnerabilidade não encontrado"));
    }

    /**
     * Busca um tipo de vulnerabilidade pelo nome.
     * @param nome Nome do tipo de vulnerabilidade.
     * @return O tipo de vulnerabilidade encontrado.
     */
    @GetMapping("/nome/{nome}")
    public ResponseEntity<TipoVulnerabilidade> buscarPorNome(@PathVariable String nome) {
        return tipoVulnerabilidadeService.buscarPorNome(nome)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tipo de vulnerabilidade não encontrado"));
    }

    /**
     * Busca tipos de vulnerabilidade pelo nome contendo o texto informado.
     * @param nome Texto a ser buscado no nome do tipo de vulnerabilidade.
     * @param pageable Informações de paginação.
     * @return Página de tipos de vulnerabilidade encontrados.
     */
    @GetMapping("/busca")
    public ResponseEntity<Page<TipoVulnerabilidade>> buscarPorNomeContendo(
            @RequestParam String nome,
            Pageable pageable) {
        return ResponseEntity.ok(tipoVulnerabilidadeService.buscarPorNomeContendo(nome, pageable));
    }

    /**
     * Busca tipos de vulnerabilidade ativos.
     * @return Lista de tipos de vulnerabilidade ativos.
     */
    @GetMapping("/ativos")
    public ResponseEntity<List<TipoVulnerabilidade>> buscarAtivos() {
        return ResponseEntity.ok(tipoVulnerabilidadeService.buscarAtivos());
    }

    /**
     * Busca tipos de vulnerabilidade ativos com paginação.
     * @param pageable Informações de paginação.
     * @return Página de tipos de vulnerabilidade ativos.
     */
    @GetMapping("/ativos/paginado")
    public ResponseEntity<Page<TipoVulnerabilidade>> buscarAtivosPaginado(Pageable pageable) {
        return ResponseEntity.ok(tipoVulnerabilidadeService.buscarAtivos(pageable));
    }

    /**
     * Salva um tipo de vulnerabilidade.
     * @param tipoVulnerabilidade Tipo de vulnerabilidade a ser salvo.
     * @return O tipo de vulnerabilidade salvo.
     */
    @PostMapping
    public ResponseEntity<TipoVulnerabilidade> salvar(@RequestBody TipoVulnerabilidade tipoVulnerabilidade) {
        try {
            TipoVulnerabilidade tipoSalvo = tipoVulnerabilidadeService.salvar(tipoVulnerabilidade);
            return ResponseEntity.status(HttpStatus.CREATED).body(tipoSalvo);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    /**
     * Atualiza um tipo de vulnerabilidade.
     * @param id ID do tipo de vulnerabilidade.
     * @param tipoVulnerabilidade Tipo de vulnerabilidade com as informações atualizadas.
     * @return O tipo de vulnerabilidade atualizado.
     */
    @PutMapping("/{id}")
    public ResponseEntity<TipoVulnerabilidade> atualizar(
            @PathVariable Long id,
            @RequestBody TipoVulnerabilidade tipoVulnerabilidade) {
        
        if (!id.equals(tipoVulnerabilidade.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID do tipo de vulnerabilidade não corresponde ao ID da URL");
        }
        
        try {
            return ResponseEntity.ok(tipoVulnerabilidadeService.salvar(tipoVulnerabilidade));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    /**
     * Ativa um tipo de vulnerabilidade.
     * @param id ID do tipo de vulnerabilidade.
     * @return O tipo de vulnerabilidade ativado.
     */
    @PatchMapping("/{id}/ativar")
    public ResponseEntity<TipoVulnerabilidade> ativar(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(tipoVulnerabilidadeService.ativar(id));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    /**
     * Inativa um tipo de vulnerabilidade.
     * @param id ID do tipo de vulnerabilidade.
     * @return O tipo de vulnerabilidade inativado.
     */
    @PatchMapping("/{id}/inativar")
    public ResponseEntity<TipoVulnerabilidade> inativar(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(tipoVulnerabilidadeService.inativar(id));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    /**
     * Exclui um tipo de vulnerabilidade.
     * @param id ID do tipo de vulnerabilidade.
     * @return Resposta sem conteúdo.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        try {
            tipoVulnerabilidadeService.excluir(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }
}
