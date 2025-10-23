package com.sistemadesaude.backend.assistenciasocial.controller;

import com.sistemadesaude.backend.assistenciasocial.entity.TipoVulnerabilidade;
import com.sistemadesaude.backend.assistenciasocial.entity.UnidadeAssistencial;
import com.sistemadesaude.backend.assistenciasocial.entity.VinculoUnidadeVulnerabilidade;
import com.sistemadesaude.backend.assistenciasocial.service.VinculoUnidadeVulnerabilidadeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller para gerenciar os vínculos entre unidades assistenciais e tipos de vulnerabilidades.
 */
@RestController
@RequestMapping("/api/assistencia-social/vinculos-unidade-vulnerabilidade")
public class VinculoUnidadeVulnerabilidadeController {

    private final VinculoUnidadeVulnerabilidadeService vinculoService;

    @Autowired
    public VinculoUnidadeVulnerabilidadeController(VinculoUnidadeVulnerabilidadeService vinculoService) {
        this.vinculoService = vinculoService;
    }

    /**
     * Obtém todos os vínculos.
     * @return Lista de vínculos.
     */
    @GetMapping
    public ResponseEntity<List<VinculoUnidadeVulnerabilidade>> buscarTodos() {
        return ResponseEntity.ok(vinculoService.buscarTodos());
    }

    /**
     * Obtém um vínculo pelo ID.
     * @param id O ID do vínculo.
     * @return O vínculo encontrado ou 404 se não encontrado.
     */
    @GetMapping("/{id}")
    public ResponseEntity<VinculoUnidadeVulnerabilidade> buscarPorId(@PathVariable Long id) {
        return vinculoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Obtém todos os vínculos para a configuração atual.
     * @return Lista de vínculos.
     */
    @GetMapping("/configuracao-atual")
    public ResponseEntity<List<VinculoUnidadeVulnerabilidade>> buscarPorConfiguracaoAtual() {
        return ResponseEntity.ok(vinculoService.buscarPorConfiguracaoAtual());
    }

    /**
     * Obtém todos os vínculos para uma unidade assistencial específica.
     * @param unidadeId O ID da unidade assistencial.
     * @return Lista de vínculos.
     */
    @GetMapping("/unidade/{unidadeId}")
    public ResponseEntity<List<VinculoUnidadeVulnerabilidade>> buscarPorUnidade(@PathVariable Long unidadeId) {
        UnidadeAssistencial unidade = new UnidadeAssistencial();
        unidade.setId(unidadeId);
        return ResponseEntity.ok(vinculoService.buscarPorUnidade(unidade));
    }

    /**
     * Obtém todos os vínculos para um tipo de vulnerabilidade específico.
     * @param tipoVulnerabilidadeId O ID do tipo de vulnerabilidade.
     * @return Lista de vínculos.
     */
    @GetMapping("/tipo-vulnerabilidade/{tipoVulnerabilidadeId}")
    public ResponseEntity<List<VinculoUnidadeVulnerabilidade>> buscarPorTipoVulnerabilidade(@PathVariable Long tipoVulnerabilidadeId) {
        TipoVulnerabilidade tipoVulnerabilidade = new TipoVulnerabilidade();
        tipoVulnerabilidade.setId(tipoVulnerabilidadeId);
        return ResponseEntity.ok(vinculoService.buscarPorTipoVulnerabilidade(tipoVulnerabilidade));
    }

    /**
     * Verifica se existe um vínculo para a unidade e tipo de vulnerabilidade.
     * @param unidadeId O ID da unidade assistencial.
     * @param tipoVulnerabilidadeId O ID do tipo de vulnerabilidade.
     * @return true se existe, false caso contrário.
     */
    @GetMapping("/existe")
    public ResponseEntity<Boolean> existeVinculo(
            @RequestParam Long unidadeId,
            @RequestParam Long tipoVulnerabilidadeId) {
        
        UnidadeAssistencial unidade = new UnidadeAssistencial();
        unidade.setId(unidadeId);
        
        TipoVulnerabilidade tipoVulnerabilidade = new TipoVulnerabilidade();
        tipoVulnerabilidade.setId(tipoVulnerabilidadeId);
        
        return ResponseEntity.ok(vinculoService.existeVinculoPorUnidadeETipoVulnerabilidade(unidade, tipoVulnerabilidade));
    }

    /**
     * Cria um novo vínculo entre uma unidade assistencial e um tipo de vulnerabilidade.
     * @param unidadeId O ID da unidade assistencial.
     * @param tipoVulnerabilidadeId O ID do tipo de vulnerabilidade.
     * @param authentication Informações de autenticação do usuário.
     * @return O vínculo criado.
     */
    @PostMapping
    public ResponseEntity<VinculoUnidadeVulnerabilidade> criar(
            @RequestParam Long unidadeId,
            @RequestParam Long tipoVulnerabilidadeId,
            Authentication authentication) {
        
        UnidadeAssistencial unidade = new UnidadeAssistencial();
        unidade.setId(unidadeId);
        
        TipoVulnerabilidade tipoVulnerabilidade = new TipoVulnerabilidade();
        tipoVulnerabilidade.setId(tipoVulnerabilidadeId);
        
        String usuarioCadastro = authentication.getName();
        
        try {
            VinculoUnidadeVulnerabilidade vinculo = vinculoService.criar(unidade, tipoVulnerabilidade, usuarioCadastro);
            return ResponseEntity.status(HttpStatus.CREATED).body(vinculo);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Atualiza um vínculo existente.
     * @param id O ID do vínculo a ser atualizado.
     * @param unidadeId O ID da nova unidade assistencial.
     * @param tipoVulnerabilidadeId O ID do novo tipo de vulnerabilidade.
     * @param authentication Informações de autenticação do usuário.
     * @return O vínculo atualizado ou 404 se não encontrado.
     */
    @PutMapping("/{id}")
    public ResponseEntity<VinculoUnidadeVulnerabilidade> atualizar(
            @PathVariable Long id,
            @RequestParam Long unidadeId,
            @RequestParam Long tipoVulnerabilidadeId,
            Authentication authentication) {
        
        UnidadeAssistencial unidade = new UnidadeAssistencial();
        unidade.setId(unidadeId);
        
        TipoVulnerabilidade tipoVulnerabilidade = new TipoVulnerabilidade();
        tipoVulnerabilidade.setId(tipoVulnerabilidadeId);
        
        String usuarioCadastro = authentication.getName();
        
        try {
            VinculoUnidadeVulnerabilidade vinculo = vinculoService.atualizar(id, unidade, tipoVulnerabilidade, usuarioCadastro);
            return ResponseEntity.ok(vinculo);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Remove um vínculo.
     * @param id O ID do vínculo a ser removido.
     * @return 204 se removido com sucesso, 404 se não encontrado.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        try {
            vinculoService.remover(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
