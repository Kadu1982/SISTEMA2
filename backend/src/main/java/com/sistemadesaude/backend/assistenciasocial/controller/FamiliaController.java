package com.sistemadesaude.backend.assistenciasocial.controller;

import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.assistenciasocial.entity.Familia;
import com.sistemadesaude.backend.assistenciasocial.service.FamiliaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;

/**
 * Controller para gerenciar as famílias no módulo de Assistência Social.
 */
@RestController
@RequestMapping("/api/assistencia-social/familias")
public class FamiliaController {

    private final FamiliaService familiaService;

    @Autowired
    public FamiliaController(FamiliaService familiaService) {
        this.familiaService = familiaService;
    }

    /**
     * Busca todas as famílias cadastradas.
     * @param pageable Paginação.
     * @return As famílias encontradas.
     */
    @GetMapping
    public ResponseEntity<Page<Familia>> buscarTodas(Pageable pageable) {
        return ResponseEntity.ok(familiaService.buscarTodas(pageable));
    }

    /**
     * Busca uma família pelo ID.
     * @param id O ID da família.
     * @return A família encontrada.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Familia> buscarPorId(@PathVariable Long id) {
        return familiaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Família não encontrada"));
    }

    /**
     * Busca uma família pelo código familiar.
     * @param codigoFamiliar O código familiar.
     * @return A família encontrada.
     */
    @GetMapping("/codigo/{codigoFamiliar}")
    public ResponseEntity<Familia> buscarPorCodigoFamiliar(@PathVariable String codigoFamiliar) {
        return familiaService.buscarPorCodigoFamiliar(codigoFamiliar)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Família não encontrada"));
    }

    /**
     * Busca famílias pelo bairro.
     * @param bairro O bairro.
     * @param pageable Paginação.
     * @return As famílias encontradas.
     */
    @GetMapping("/bairro/{bairro}")
    public ResponseEntity<Page<Familia>> buscarPorBairro(@PathVariable String bairro, Pageable pageable) {
        return ResponseEntity.ok(familiaService.buscarPorBairro(bairro, pageable));
    }

    /**
     * Busca famílias por faixa de renda per capita.
     * @param rendaPerCapitaMin A renda per capita mínima.
     * @param rendaPerCapitaMax A renda per capita máxima.
     * @param pageable Paginação.
     * @return As famílias encontradas.
     */
    @GetMapping("/renda")
    public ResponseEntity<Page<Familia>> buscarPorRendaPerCapita(
            @RequestParam BigDecimal rendaPerCapitaMin,
            @RequestParam BigDecimal rendaPerCapitaMax,
            Pageable pageable) {
        return ResponseEntity.ok(familiaService.buscarPorRendaPerCapita(rendaPerCapitaMin, rendaPerCapitaMax, pageable));
    }

    /**
     * Busca famílias por nome do responsável.
     * @param nome O nome do responsável.
     * @param pageable Paginação.
     * @return As famílias encontradas.
     */
    @GetMapping("/responsavel")
    public ResponseEntity<Page<Familia>> buscarPorNomeResponsavel(@RequestParam String nome, Pageable pageable) {
        return ResponseEntity.ok(familiaService.buscarPorNomeResponsavel(nome, pageable));
    }

    /**
     * Busca famílias por tipo de família.
     * @param tipoFamilia O tipo de família.
     * @param pageable Paginação.
     * @return As famílias encontradas.
     */
    @GetMapping("/tipo/{tipoFamilia}")
    public ResponseEntity<Page<Familia>> buscarPorTipoFamilia(
            @PathVariable Familia.TipoFamilia tipoFamilia,
            Pageable pageable) {
        return ResponseEntity.ok(familiaService.buscarPorTipoFamilia(tipoFamilia, pageable));
    }

    /**
     * Salva uma família.
     * @param familia A família a ser salva.
     * @param authentication Informações de autenticação do usuário.
     * @return A família salva.
     */
    @PostMapping
    public ResponseEntity<Familia> salvar(@RequestBody Familia familia, Authentication authentication) {
        String usuarioCadastro = authentication.getName();
        return ResponseEntity.status(HttpStatus.CREATED).body(familiaService.salvar(familia, usuarioCadastro));
    }

    /**
     * Atualiza uma família.
     * @param id O ID da família.
     * @param familia A família com as informações atualizadas.
     * @param authentication Informações de autenticação do usuário.
     * @return A família atualizada.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Familia> atualizar(
            @PathVariable Long id,
            @RequestBody Familia familia,
            Authentication authentication) {
        
        if (!id.equals(familia.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID da família não corresponde ao ID da URL");
        }
        
        String usuarioAtualizacao = authentication.getName();
        return ResponseEntity.ok(familiaService.salvar(familia, usuarioAtualizacao));
    }

    /**
     * Adiciona um membro à família.
     * @param id O ID da família.
     * @param pacienteId O ID do paciente a ser adicionado como membro.
     * @param parentesco O parentesco do membro com o responsável pela família.
     * @param authentication Informações de autenticação do usuário.
     * @return A família atualizada.
     */
    @PostMapping("/{id}/membros")
    public ResponseEntity<Familia> adicionarMembro(
            @PathVariable Long id,
            @RequestParam Long pacienteId,
            @RequestParam String parentesco,
            Authentication authentication) {
        
        Familia familia = familiaService.buscarPorId(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Família não encontrada"));
        
        // Aqui seria necessário buscar o paciente pelo ID
        // Esta implementação depende do serviço de pacientes
        Paciente paciente = new Paciente();
        paciente.setId(pacienteId);
        
        String usuarioCadastro = authentication.getName();
        return ResponseEntity.ok(familiaService.adicionarMembro(familia, paciente, parentesco, usuarioCadastro));
    }

    /**
     * Remove um membro da família.
     * @param id O ID da família.
     * @param pacienteId O ID do paciente a ser removido.
     * @param motivoSaida O motivo da saída do membro.
     * @param authentication Informações de autenticação do usuário.
     * @return A família atualizada.
     */
    @DeleteMapping("/{id}/membros/{pacienteId}")
    public ResponseEntity<Familia> removerMembro(
            @PathVariable Long id,
            @PathVariable Long pacienteId,
            @RequestParam String motivoSaida,
            Authentication authentication) {
        
        Familia familia = familiaService.buscarPorId(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Família não encontrada"));
        
        // Aqui seria necessário buscar o paciente pelo ID
        // Esta implementação depende do serviço de pacientes
        Paciente paciente = new Paciente();
        paciente.setId(pacienteId);
        
        String usuarioAtualizacao = authentication.getName();
        return ResponseEntity.ok(familiaService.removerMembro(familia, paciente, motivoSaida, usuarioAtualizacao));
    }

    /**
     * Troca o responsável pela família.
     * @param id O ID da família.
     * @param novoResponsavelId O ID do novo responsável pela família.
     * @param authentication Informações de autenticação do usuário.
     * @return A família atualizada.
     */
    @PatchMapping("/{id}/responsavel")
    public ResponseEntity<Familia> trocarResponsavel(
            @PathVariable Long id,
            @RequestParam Long novoResponsavelId,
            Authentication authentication) {
        
        Familia familia = familiaService.buscarPorId(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Família não encontrada"));
        
        // Aqui seria necessário buscar o paciente pelo ID
        // Esta implementação depende do serviço de pacientes
        Paciente novoResponsavel = new Paciente();
        novoResponsavel.setId(novoResponsavelId);
        
        String usuarioAtualizacao = authentication.getName();
        return ResponseEntity.ok(familiaService.trocarResponsavel(familia, novoResponsavel, usuarioAtualizacao));
    }

    /**
     * Calcula a renda per capita da família.
     * @param id O ID da família.
     * @return A renda per capita da família.
     */
    @GetMapping("/{id}/renda-per-capita")
    public ResponseEntity<BigDecimal> calcularRendaPerCapita(@PathVariable Long id) {
        Familia familia = familiaService.buscarPorId(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Família não encontrada"));
        
        return ResponseEntity.ok(familiaService.calcularRendaPerCapita(familia));
    }
}
