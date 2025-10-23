package com.sistemadesaude.backend.assistenciasocial.controller;

import com.sistemadesaude.backend.operador.entity.Operador;
import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.assistenciasocial.entity.Encaminhamento;
import com.sistemadesaude.backend.assistenciasocial.entity.Familia;
import com.sistemadesaude.backend.assistenciasocial.entity.OrgaoRedeAssistencial;
import com.sistemadesaude.backend.assistenciasocial.entity.TipoEncaminhamento;
import com.sistemadesaude.backend.assistenciasocial.entity.UnidadeAssistencial;
import com.sistemadesaude.backend.assistenciasocial.service.EncaminhamentoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

/**
 * Controller para gerenciar os encaminhamentos no módulo de Assistência Social.
 */
@RestController
@RequestMapping("/api/assistencia-social/encaminhamentos")
public class EncaminhamentoController {

    private final EncaminhamentoService encaminhamentoService;

    @Autowired
    public EncaminhamentoController(EncaminhamentoService encaminhamentoService) {
        this.encaminhamentoService = encaminhamentoService;
    }

    /**
     * Busca todos os encaminhamentos.
     * @param pageable Informações de paginação.
     * @return Página de encaminhamentos.
     */
    @GetMapping
    public ResponseEntity<Page<Encaminhamento>> buscarTodos(Pageable pageable) {
        return ResponseEntity.ok(encaminhamentoService.buscarTodos(pageable));
    }

    /**
     * Busca um encaminhamento pelo ID.
     * @param id ID do encaminhamento.
     * @return O encaminhamento encontrado.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Encaminhamento> buscarPorId(@PathVariable Long id) {
        return encaminhamentoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Encaminhamento não encontrado"));
    }

    /**
     * Busca encaminhamentos por unidade assistencial.
     * @param unidadeId ID da unidade assistencial.
     * @param pageable Paginação.
     * @return Os encaminhamentos encontrados.
     */
    @GetMapping("/unidade/{unidadeId}")
    public ResponseEntity<Page<Encaminhamento>> buscarPorUnidade(
            @PathVariable Long unidadeId,
            Pageable pageable) {
        // Aqui seria necessário buscar a unidade assistencial pelo ID
        // Esta implementação depende do serviço de unidades assistenciais
        UnidadeAssistencial unidade = new UnidadeAssistencial();
        unidade.setId(unidadeId);
        
        return ResponseEntity.ok(encaminhamentoService.buscarPorUnidade(unidade, pageable));
    }

    /**
     * Busca encaminhamentos por paciente.
     * @param pacienteId ID do paciente.
     * @param pageable Paginação.
     * @return Os encaminhamentos encontrados.
     */
    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<Page<Encaminhamento>> buscarPorPaciente(
            @PathVariable Long pacienteId,
            Pageable pageable) {
        // Aqui seria necessário buscar o paciente pelo ID
        // Esta implementação depende do serviço de pacientes
        Paciente paciente = new Paciente();
        paciente.setId(pacienteId);
        
        return ResponseEntity.ok(encaminhamentoService.buscarPorPaciente(paciente, pageable));
    }

    /**
     * Busca encaminhamentos por família.
     * @param familiaId ID da família.
     * @param pageable Paginação.
     * @return Os encaminhamentos encontrados.
     */
    @GetMapping("/familia/{familiaId}")
    public ResponseEntity<Page<Encaminhamento>> buscarPorFamilia(
            @PathVariable Long familiaId,
            Pageable pageable) {
        // Aqui seria necessário buscar a família pelo ID
        // Esta implementação depende do serviço de famílias
        Familia familia = new Familia();
        familia.setId(familiaId);
        
        return ResponseEntity.ok(encaminhamentoService.buscarPorFamilia(familia, pageable));
    }

    /**
     * Busca encaminhamentos por profissional.
     * @param profissionalId ID do profissional.
     * @param pageable Paginação.
     * @return Os encaminhamentos encontrados.
     */
    @GetMapping("/profissional/{profissionalId}")
    public ResponseEntity<Page<Encaminhamento>> buscarPorProfissional(
            @PathVariable Long profissionalId,
            Pageable pageable) {
        // Aqui seria necessário buscar o profissional pelo ID
        // Esta implementação depende do serviço de profissionais
        Operador profissional = new Operador();
        profissional.setId(profissionalId);
        
        return ResponseEntity.ok(encaminhamentoService.buscarPorProfissional(profissional, pageable));
    }

    /**
     * Busca encaminhamentos por tipo de encaminhamento.
     * @param tipoEncaminhamentoId ID do tipo de encaminhamento.
     * @param pageable Paginação.
     * @return Os encaminhamentos encontrados.
     */
    @GetMapping("/tipo/{tipoEncaminhamentoId}")
    public ResponseEntity<Page<Encaminhamento>> buscarPorTipoEncaminhamento(
            @PathVariable Long tipoEncaminhamentoId,
            Pageable pageable) {
        // Aqui seria necessário buscar o tipo de encaminhamento pelo ID
        // Esta implementação depende do serviço de tipos de encaminhamento
        TipoEncaminhamento tipoEncaminhamento = new TipoEncaminhamento();
        tipoEncaminhamento.setId(tipoEncaminhamentoId);
        
        return ResponseEntity.ok(encaminhamentoService.buscarPorTipoEncaminhamento(tipoEncaminhamento, pageable));
    }

    /**
     * Busca encaminhamentos por destino.
     * @param destinoId ID do destino.
     * @param pageable Paginação.
     * @return Os encaminhamentos encontrados.
     */
    @GetMapping("/destino/{destinoId}")
    public ResponseEntity<Page<Encaminhamento>> buscarPorDestino(
            @PathVariable Long destinoId,
            Pageable pageable) {
        // Aqui seria necessário buscar o destino pelo ID
        // Esta implementação depende do serviço de órgãos da rede assistencial
        OrgaoRedeAssistencial destino = new OrgaoRedeAssistencial();
        destino.setId(destinoId);
        
        return ResponseEntity.ok(encaminhamentoService.buscarPorDestino(destino, pageable));
    }

    /**
     * Busca encaminhamentos por período.
     * @param dataInicio A data de início do período.
     * @param dataFim A data de fim do período.
     * @param pageable Paginação.
     * @return Os encaminhamentos encontrados.
     */
    @GetMapping("/periodo")
    public ResponseEntity<Page<Encaminhamento>> buscarPorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim,
            Pageable pageable) {
        return ResponseEntity.ok(encaminhamentoService.buscarPorPeriodo(dataInicio, dataFim, pageable));
    }

    /**
     * Busca encaminhamentos pendentes de contra-referência.
     * @param dataLimite Data limite para considerar um encaminhamento como pendente.
     * @param pageable Paginação.
     * @return Os encaminhamentos encontrados.
     */
    @GetMapping("/pendentes")
    public ResponseEntity<Page<Encaminhamento>> buscarPendentes(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataLimite,
            Pageable pageable) {
        return ResponseEntity.ok(encaminhamentoService.buscarPendentes(dataLimite, pageable));
    }

    /**
     * Conta o número de encaminhamentos por unidade assistencial e período.
     * @param unidadeId ID da unidade assistencial.
     * @param dataInicio A data de início do período.
     * @param dataFim A data de fim do período.
     * @return O número de encaminhamentos.
     */
    @GetMapping("/unidade/{unidadeId}/periodo/contagem")
    public ResponseEntity<Long> contarPorUnidadeEPeriodo(
            @PathVariable Long unidadeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        // Aqui seria necessário buscar a unidade assistencial pelo ID
        // Esta implementação depende do serviço de unidades assistenciais
        UnidadeAssistencial unidade = new UnidadeAssistencial();
        unidade.setId(unidadeId);
        
        return ResponseEntity.ok(encaminhamentoService.contarPorUnidadeEPeriodo(unidade, dataInicio, dataFim));
    }

    /**
     * Conta o número de encaminhamentos por tipo de encaminhamento e período.
     * @param tipoEncaminhamentoId ID do tipo de encaminhamento.
     * @param dataInicio A data de início do período.
     * @param dataFim A data de fim do período.
     * @return O número de encaminhamentos.
     */
    @GetMapping("/tipo/{tipoEncaminhamentoId}/periodo/contagem")
    public ResponseEntity<Long> contarPorTipoEPeriodo(
            @PathVariable Long tipoEncaminhamentoId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        // Aqui seria necessário buscar o tipo de encaminhamento pelo ID
        // Esta implementação depende do serviço de tipos de encaminhamento
        TipoEncaminhamento tipoEncaminhamento = new TipoEncaminhamento();
        tipoEncaminhamento.setId(tipoEncaminhamentoId);
        
        return ResponseEntity.ok(encaminhamentoService.contarPorTipoEPeriodo(tipoEncaminhamento, dataInicio, dataFim));
    }

    /**
     * Salva um encaminhamento.
     * @param encaminhamento Encaminhamento a ser salvo.
     * @param authentication Informações de autenticação do usuário.
     * @return O encaminhamento salvo.
     */
    @PostMapping
    public ResponseEntity<Encaminhamento> salvar(
            @RequestBody Encaminhamento encaminhamento,
            Authentication authentication) {
        try {
            String usuarioCadastro = authentication.getName();
            Encaminhamento encaminhamentoSalvo = encaminhamentoService.salvar(encaminhamento, usuarioCadastro);
            return ResponseEntity.status(HttpStatus.CREATED).body(encaminhamentoSalvo);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        }
    }

    /**
     * Registra a contra-referência de um encaminhamento.
     * @param id ID do encaminhamento.
     * @param encaminhamento Encaminhamento com os dados da contra-referência.
     * @param authentication Informações de autenticação do usuário.
     * @return O encaminhamento atualizado.
     */
    @PutMapping("/{id}/contrareferencia")
    public ResponseEntity<Encaminhamento> registrarContrareferencia(
            @PathVariable Long id,
            @RequestBody Encaminhamento encaminhamento,
            Authentication authentication) {
        try {
            String usuarioAtualizacao = authentication.getName();
            
            // Extrair os dados da contra-referência do encaminhamento recebido
            LocalDate dataContrareferencia = encaminhamento.getDataContrareferencia();
            String profissionalContrareferencia = encaminhamento.getProfissionalContrareferencia();
            String telefoneContrareferencia = encaminhamento.getTelefoneContrareferencia();
            String anotacoesContrareferencia = encaminhamento.getAnotacoesContrareferencia();
            
            return ResponseEntity.ok(encaminhamentoService.registrarContrareferencia(
                    id, 
                    dataContrareferencia, 
                    profissionalContrareferencia, 
                    telefoneContrareferencia, 
                    anotacoesContrareferencia, 
                    usuarioAtualizacao));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        }
    }
}
