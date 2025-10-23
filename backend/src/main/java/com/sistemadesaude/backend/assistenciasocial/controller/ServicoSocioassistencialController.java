package com.sistemadesaude.backend.assistenciasocial.controller;

import com.sistemadesaude.backend.assistenciasocial.entity.GrupoServicoSocioassistencial;
import com.sistemadesaude.backend.assistenciasocial.entity.ServicoSocioassistencial;
import com.sistemadesaude.backend.assistenciasocial.service.ServicoSocioassistencialService;
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
 * Controller para gerenciar os serviços socioassistenciais no módulo de Assistência Social.
 */
@RestController
@RequestMapping("/api/assistencia-social/servicos")
public class ServicoSocioassistencialController {

    private final ServicoSocioassistencialService servicoService;

    @Autowired
    public ServicoSocioassistencialController(ServicoSocioassistencialService servicoService) {
        this.servicoService = servicoService;
    }

    /**
     * Busca todos os serviços socioassistenciais.
     * @return Lista de todos os serviços socioassistenciais.
     */
    @GetMapping
    public ResponseEntity<List<ServicoSocioassistencial>> buscarTodos() {
        return ResponseEntity.ok(servicoService.buscarTodos());
    }

    /**
     * Busca todos os serviços socioassistenciais com paginação.
     * @param pageable Informações de paginação.
     * @return Página de serviços socioassistenciais.
     */
    @GetMapping("/paginado")
    public ResponseEntity<Page<ServicoSocioassistencial>> buscarTodosPaginado(Pageable pageable) {
        return ResponseEntity.ok(servicoService.buscarTodos(pageable));
    }

    /**
     * Busca um serviço socioassistencial pelo ID.
     * @param id ID do serviço socioassistencial.
     * @return O serviço socioassistencial encontrado.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ServicoSocioassistencial> buscarPorId(@PathVariable Long id) {
        return servicoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Serviço socioassistencial não encontrado"));
    }

    /**
     * Busca um serviço socioassistencial pelo nome.
     * @param nome Nome do serviço socioassistencial.
     * @return O serviço socioassistencial encontrado.
     */
    @GetMapping("/nome/{nome}")
    public ResponseEntity<ServicoSocioassistencial> buscarPorNome(@PathVariable String nome) {
        return servicoService.buscarPorNome(nome)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Serviço socioassistencial não encontrado"));
    }

    /**
     * Busca serviços socioassistenciais pelo nome contendo o texto informado.
     * @param nome Texto a ser buscado no nome do serviço socioassistencial.
     * @param pageable Informações de paginação.
     * @return Página de serviços socioassistenciais encontrados.
     */
    @GetMapping("/busca")
    public ResponseEntity<Page<ServicoSocioassistencial>> buscarPorNomeContendo(
            @RequestParam String nome,
            Pageable pageable) {
        return ResponseEntity.ok(servicoService.buscarPorNomeContendo(nome, pageable));
    }

    /**
     * Busca serviços socioassistenciais ativos.
     * @return Lista de serviços socioassistenciais ativos.
     */
    @GetMapping("/ativos")
    public ResponseEntity<List<ServicoSocioassistencial>> buscarAtivos() {
        return ResponseEntity.ok(servicoService.buscarAtivos());
    }

    /**
     * Busca serviços socioassistenciais ativos com paginação.
     * @param pageable Informações de paginação.
     * @return Página de serviços socioassistenciais ativos.
     */
    @GetMapping("/ativos/paginado")
    public ResponseEntity<Page<ServicoSocioassistencial>> buscarAtivosPaginado(Pageable pageable) {
        return ResponseEntity.ok(servicoService.buscarAtivos(pageable));
    }

    /**
     * Busca serviços socioassistenciais com vagas disponíveis.
     * @return Lista de serviços socioassistenciais com vagas disponíveis.
     */
    @GetMapping("/vagas-disponiveis")
    public ResponseEntity<List<ServicoSocioassistencial>> buscarComVagasDisponiveis() {
        return ResponseEntity.ok(servicoService.buscarComVagasDisponiveis());
    }

    /**
     * Salva um serviço socioassistencial.
     * @param servico Serviço socioassistencial a ser salvo.
     * @param authentication Informações de autenticação do usuário.
     * @return O serviço socioassistencial salvo.
     */
    @PostMapping
    public ResponseEntity<ServicoSocioassistencial> salvar(
            @RequestBody ServicoSocioassistencial servico,
            Authentication authentication) {
        try {
            String usuarioCadastro = authentication.getName();
            ServicoSocioassistencial servicoSalvo = servicoService.salvar(servico, usuarioCadastro);
            return ResponseEntity.status(HttpStatus.CREATED).body(servicoSalvo);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    /**
     * Atualiza um serviço socioassistencial.
     * @param id ID do serviço socioassistencial.
     * @param servico Serviço socioassistencial com as informações atualizadas.
     * @param authentication Informações de autenticação do usuário.
     * @return O serviço socioassistencial atualizado.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ServicoSocioassistencial> atualizar(
            @PathVariable Long id,
            @RequestBody ServicoSocioassistencial servico,
            Authentication authentication) {
        
        if (!id.equals(servico.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID do serviço socioassistencial não corresponde ao ID da URL");
        }
        
        try {
            String usuarioAtualizacao = authentication.getName();
            return ResponseEntity.ok(servicoService.salvar(servico, usuarioAtualizacao));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    /**
     * Adiciona um grupo ao serviço socioassistencial.
     * @param id ID do serviço socioassistencial.
     * @param grupo Grupo a ser adicionado.
     * @param authentication Informações de autenticação do usuário.
     * @return O serviço socioassistencial atualizado.
     */
    @PostMapping("/{id}/grupos")
    public ResponseEntity<ServicoSocioassistencial> adicionarGrupo(
            @PathVariable Long id,
            @RequestBody GrupoServicoSocioassistencial grupo,
            Authentication authentication) {
        
        try {
            String usuarioCadastro = authentication.getName();
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(servicoService.adicionarGrupo(id, grupo, usuarioCadastro));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    /**
     * Ativa um serviço socioassistencial.
     * @param id ID do serviço socioassistencial.
     * @param authentication Informações de autenticação do usuário.
     * @return O serviço socioassistencial ativado.
     */
    @PatchMapping("/{id}/ativar")
    public ResponseEntity<ServicoSocioassistencial> ativar(
            @PathVariable Long id,
            Authentication authentication) {
        
        try {
            String usuarioAtualizacao = authentication.getName();
            return ResponseEntity.ok(servicoService.ativar(id, usuarioAtualizacao));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    /**
     * Inativa um serviço socioassistencial.
     * @param id ID do serviço socioassistencial.
     * @param authentication Informações de autenticação do usuário.
     * @return O serviço socioassistencial inativado.
     */
    @PatchMapping("/{id}/inativar")
    public ResponseEntity<ServicoSocioassistencial> inativar(
            @PathVariable Long id,
            Authentication authentication) {
        
        try {
            String usuarioAtualizacao = authentication.getName();
            return ResponseEntity.ok(servicoService.inativar(id, usuarioAtualizacao));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    /**
     * Exclui um serviço socioassistencial.
     * @param id ID do serviço socioassistencial.
     * @return Resposta sem conteúdo.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        try {
            servicoService.excluir(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }
}
