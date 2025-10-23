package com.sistemadesaude.backend.assistenciasocial.controller;

import com.sistemadesaude.backend.assistenciasocial.entity.Beneficio;
import com.sistemadesaude.backend.assistenciasocial.entity.TipoBeneficio;
import com.sistemadesaude.backend.assistenciasocial.service.BeneficioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * Controller para gerenciar os benefícios no módulo de Assistência Social.
 */
@RestController
@RequestMapping("/api/assistencia-social/beneficios")
public class BeneficioController {

    private final BeneficioService beneficioService;

    @Autowired
    public BeneficioController(BeneficioService beneficioService) {
        this.beneficioService = beneficioService;
    }

    /**
     * Busca todos os benefícios.
     * @return Lista de todos os benefícios.
     */
    @GetMapping
    public ResponseEntity<List<Beneficio>> buscarTodos() {
        return ResponseEntity.ok(beneficioService.buscarTodos());
    }

    /**
     * Busca todos os benefícios com paginação.
     * @param pageable Informações de paginação.
     * @return Página de benefícios.
     */
    @GetMapping("/paginado")
    public ResponseEntity<Page<Beneficio>> buscarTodosPaginado(Pageable pageable) {
        return ResponseEntity.ok(beneficioService.buscarTodos(pageable));
    }

    /**
     * Busca um benefício pelo ID.
     * @param id ID do benefício.
     * @return O benefício encontrado.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Beneficio> buscarPorId(@PathVariable Long id) {
        return beneficioService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Benefício não encontrado"));
    }

    /**
     * Busca um benefício pelo nome.
     * @param nome Nome do benefício.
     * @return O benefício encontrado.
     */
    @GetMapping("/nome/{nome}")
    public ResponseEntity<Beneficio> buscarPorNome(@PathVariable String nome) {
        return beneficioService.buscarPorNome(nome)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Benefício não encontrado"));
    }

    /**
     * Busca benefícios pelo nome contendo o texto informado.
     * @param nome Texto a ser buscado no nome do benefício.
     * @param pageable Informações de paginação.
     * @return Página de benefícios encontrados.
     */
    @GetMapping("/busca")
    public ResponseEntity<Page<Beneficio>> buscarPorNomeContendo(
            @RequestParam String nome,
            Pageable pageable) {
        return ResponseEntity.ok(beneficioService.buscarPorNomeContendo(nome, pageable));
    }

    /**
     * Busca benefícios ativos.
     * @return Lista de benefícios ativos.
     */
    @GetMapping("/ativos")
    public ResponseEntity<List<Beneficio>> buscarAtivos() {
        return ResponseEntity.ok(beneficioService.buscarAtivos());
    }

    /**
     * Busca benefícios ativos com paginação.
     * @param pageable Informações de paginação.
     * @return Página de benefícios ativos.
     */
    @GetMapping("/ativos/paginado")
    public ResponseEntity<Page<Beneficio>> buscarAtivosPaginado(Pageable pageable) {
        return ResponseEntity.ok(beneficioService.buscarAtivos(pageable));
    }

    /**
     * Busca benefícios por tipo de benefício.
     * @param tipoBeneficioId ID do tipo de benefício.
     * @return Lista de benefícios do tipo especificado.
     */
    @GetMapping("/tipo/{tipoBeneficioId}")
    public ResponseEntity<List<Beneficio>> buscarPorTipo(@PathVariable Long tipoBeneficioId) {
        // Aqui seria necessário buscar o tipo de benefício pelo ID
        // Esta implementação depende do serviço de tipos de benefício
        TipoBeneficio tipoBeneficio = new TipoBeneficio();
        tipoBeneficio.setId(tipoBeneficioId);
        
        return ResponseEntity.ok(beneficioService.buscarPorTipo(tipoBeneficio));
    }

    /**
     * Busca benefícios por tipo de benefício com paginação.
     * @param tipoBeneficioId ID do tipo de benefício.
     * @param pageable Informações de paginação.
     * @return Página de benefícios do tipo especificado.
     */
    @GetMapping("/tipo/{tipoBeneficioId}/paginado")
    public ResponseEntity<Page<Beneficio>> buscarPorTipoPaginado(
            @PathVariable Long tipoBeneficioId,
            Pageable pageable) {
        // Aqui seria necessário buscar o tipo de benefício pelo ID
        // Esta implementação depende do serviço de tipos de benefício
        TipoBeneficio tipoBeneficio = new TipoBeneficio();
        tipoBeneficio.setId(tipoBeneficioId);
        
        return ResponseEntity.ok(beneficioService.buscarPorTipo(tipoBeneficio, pageable));
    }

    /**
     * Busca benefícios ativos por tipo de benefício.
     * @param tipoBeneficioId ID do tipo de benefício.
     * @return Lista de benefícios ativos do tipo especificado.
     */
    @GetMapping("/tipo/{tipoBeneficioId}/ativos")
    public ResponseEntity<List<Beneficio>> buscarAtivosPorTipo(@PathVariable Long tipoBeneficioId) {
        // Aqui seria necessário buscar o tipo de benefício pelo ID
        // Esta implementação depende do serviço de tipos de benefício
        TipoBeneficio tipoBeneficio = new TipoBeneficio();
        tipoBeneficio.setId(tipoBeneficioId);
        
        return ResponseEntity.ok(beneficioService.buscarAtivosPorTipo(tipoBeneficio));
    }

    /**
     * Salva um benefício.
     * @param beneficio Benefício a ser salvo.
     * @param authentication Informações de autenticação do usuário.
     * @return O benefício salvo.
     */
    @PostMapping
    public ResponseEntity<Beneficio> salvar(
            @RequestBody Beneficio beneficio,
            Authentication authentication) {
        try {
            String usuarioCadastro = authentication.getName();
            Beneficio beneficioSalvo = beneficioService.salvar(beneficio, usuarioCadastro);
            return ResponseEntity.status(HttpStatus.CREATED).body(beneficioSalvo);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    /**
     * Atualiza um benefício.
     * @param id ID do benefício.
     * @param beneficio Benefício com as informações atualizadas.
     * @param authentication Informações de autenticação do usuário.
     * @return O benefício atualizado.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Beneficio> atualizar(
            @PathVariable Long id,
            @RequestBody Beneficio beneficio,
            Authentication authentication) {
        
        if (!id.equals(beneficio.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID do benefício não corresponde ao ID da URL");
        }
        
        try {
            String usuarioAtualizacao = authentication.getName();
            return ResponseEntity.ok(beneficioService.salvar(beneficio, usuarioAtualizacao));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    /**
     * Ativa um benefício.
     * @param id ID do benefício.
     * @param authentication Informações de autenticação do usuário.
     * @return O benefício ativado.
     */
    @PatchMapping("/{id}/ativar")
    public ResponseEntity<Beneficio> ativar(
            @PathVariable Long id,
            Authentication authentication) {
        
        try {
            String usuarioAtualizacao = authentication.getName();
            return ResponseEntity.ok(beneficioService.ativar(id, usuarioAtualizacao));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    /**
     * Inativa um benefício.
     * @param id ID do benefício.
     * @param authentication Informações de autenticação do usuário.
     * @return O benefício inativado.
     */
    @PatchMapping("/{id}/inativar")
    public ResponseEntity<Beneficio> inativar(
            @PathVariable Long id,
            Authentication authentication) {
        
        try {
            String usuarioAtualizacao = authentication.getName();
            return ResponseEntity.ok(beneficioService.inativar(id, usuarioAtualizacao));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    /**
     * Exclui um benefício.
     * @param id ID do benefício.
     * @return Resposta sem conteúdo.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        try {
            beneficioService.excluir(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }
}
