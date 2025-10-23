package com.sistemadesaude.backend.assistenciasocial.controller;

import com.sistemadesaude.backend.operador.entity.Operador;
import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.assistenciasocial.entity.AtendimentoAssistencial;
import com.sistemadesaude.backend.assistenciasocial.entity.Familia;
import com.sistemadesaude.backend.assistenciasocial.entity.MotivoAtendimento;
import com.sistemadesaude.backend.assistenciasocial.entity.ServicoSocioassistencial;
import com.sistemadesaude.backend.assistenciasocial.entity.UnidadeAssistencial;
import com.sistemadesaude.backend.assistenciasocial.service.AtendimentoAssistencialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

/**
 * Controller para gerenciar os atendimentos assistenciais no módulo de Assistência Social.
 */
@RestController
@RequestMapping("/api/assistencia-social/atendimentos")
public class AtendimentoAssistencialController {

    private final AtendimentoAssistencialService atendimentoService;

    @Autowired
    public AtendimentoAssistencialController(AtendimentoAssistencialService atendimentoService) {
        this.atendimentoService = atendimentoService;
    }

    /**
     * Busca todos os atendimentos assistenciais.
     * @param pageable Informações de paginação.
     * @return Página de atendimentos assistenciais.
     */
    @GetMapping
    public ResponseEntity<Page<AtendimentoAssistencial>> buscarTodos(Pageable pageable) {
        return ResponseEntity.ok(atendimentoService.buscarTodos(pageable));
    }

    /**
     * Busca um atendimentover assistencial pelo ID.
     * @param id ID do atendimentover assistencial.
     * @return O atendimentover assistencial encontrado.
     */
    @GetMapping("/{id}")
    public ResponseEntity<AtendimentoAssistencial> buscarPorId(@PathVariable Long id) {
        return atendimentoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Atendimento assistencial não encontrado"));
    }

    /**
     * Busca atendimentos por unidade assistencial.
     * @param unidadeId ID da unidade assistencial.
     * @param pageable Paginação.
     * @return Os atendimentos encontrados.
     */
    @GetMapping("/unidade/{unidadeId}")
    public ResponseEntity<Page<AtendimentoAssistencial>> buscarPorUnidade(
            @PathVariable Long unidadeId,
            Pageable pageable) {
        // Aqui seria necessário buscar a unidade assistencial pelo ID
        // Esta implementação depende do serviço de unidades assistenciais
        UnidadeAssistencial unidade = new UnidadeAssistencial();
        unidade.setId(unidadeId);
        
        return ResponseEntity.ok(atendimentoService.buscarPorUnidade(unidade, pageable));
    }

    /**
     * Busca atendimentos por paciente.
     * @param pacienteId ID do paciente.
     * @param pageable Paginação.
     * @return Os atendimentos encontrados.
     */
    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<Page<AtendimentoAssistencial>> buscarPorPaciente(
            @PathVariable Long pacienteId,
            Pageable pageable) {
        // Aqui seria necessário buscar o paciente pelo ID
        // Esta implementação depende do serviço de pacientes
        Paciente paciente = new Paciente();
        paciente.setId(pacienteId);
        
        return ResponseEntity.ok(atendimentoService.buscarPorPaciente(paciente, pageable));
    }

    /**
     * Busca atendimentos por família.
     * @param familiaId ID da família.
     * @param pageable Paginação.
     * @return Os atendimentos encontrados.
     */
    @GetMapping("/familia/{familiaId}")
    public ResponseEntity<Page<AtendimentoAssistencial>> buscarPorFamilia(
            @PathVariable Long familiaId,
            Pageable pageable) {
        // Aqui seria necessário buscar a família pelo ID
        // Esta implementação depende do serviço de famílias
        Familia familia = new Familia();
        familia.setId(familiaId);
        
        return ResponseEntity.ok(atendimentoService.buscarPorFamilia(familia, pageable));
    }

    /**
     * Busca atendimentos por profissional.
     * @param profissionalId ID do profissional.
     * @param pageable Paginação.
     * @return Os atendimentos encontrados.
     */
    @GetMapping("/profissional/{profissionalId}")
    public ResponseEntity<Page<AtendimentoAssistencial>> buscarPorProfissional(
            @PathVariable Long profissionalId,
            Pageable pageable) {
        // Aqui seria necessário buscar o profissional pelo ID
        // Esta implementação depende do serviço de profissionais
        Operador profissional = new Operador();
        profissional.setId(profissionalId);
        
        return ResponseEntity.ok(atendimentoService.buscarPorProfissional(profissional, pageable));
    }

    /**
     * Busca atendimentos por serviço socioassistencial.
     * @param servicoId ID do serviço socioassistencial.
     * @param pageable Paginação.
     * @return Os atendimentos encontrados.
     */
    @GetMapping("/servico/{servicoId}")
    public ResponseEntity<Page<AtendimentoAssistencial>> buscarPorServico(
            @PathVariable Long servicoId,
            Pageable pageable) {
        // Aqui seria necessário buscar o serviço socioassistencial pelo ID
        // Esta implementação depende do serviço de serviços socioassistenciais
        ServicoSocioassistencial servico = new ServicoSocioassistencial();
        servico.setId(servicoId);
        
        return ResponseEntity.ok(atendimentoService.buscarPorServico(servico, pageable));
    }

    /**
     * Busca atendimentos por período.
     * @param dataInicio A data de início do período.
     * @param dataFim A data de fim do período.
     * @param pageable Paginação.
     * @return Os atendimentos encontrados.
     */
    @GetMapping("/periodo")
    public ResponseEntity<Page<AtendimentoAssistencial>> buscarPorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataFim,
            Pageable pageable) {
        return ResponseEntity.ok(atendimentoService.buscarPorPeriodo(dataInicio, dataFim, pageable));
    }

    /**
     * Busca atendimentos por tipo de atendimentover.
     * @param tipoAtendimento O tipo de atendimentover.
     * @param pageable Paginação.
     * @return Os atendimentos encontrados.
     */
    @GetMapping("/tipo/{tipoAtendimento}")
    public ResponseEntity<Page<AtendimentoAssistencial>> buscarPorTipoAtendimento(
            @PathVariable AtendimentoAssistencial.TipoAtendimento tipoAtendimento,
            Pageable pageable) {
        return ResponseEntity.ok(atendimentoService.buscarPorTipoAtendimento(tipoAtendimento, pageable));
    }

    /**
     * Busca atendimentos por unidade assistencial e período.
     * @param unidadeId ID da unidade assistencial.
     * @param dataInicio A data de início do período.
     * @param dataFim A data de fim do período.
     * @param pageable Paginação.
     * @return Os atendimentos encontrados.
     */
    @GetMapping("/unidade/{unidadeId}/periodo")
    public ResponseEntity<Page<AtendimentoAssistencial>> buscarPorUnidadeEPeriodo(
            @PathVariable Long unidadeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataFim,
            Pageable pageable) {
        // Aqui seria necessário buscar a unidade assistencial pelo ID
        // Esta implementação depende do serviço de unidades assistenciais
        UnidadeAssistencial unidade = new UnidadeAssistencial();
        unidade.setId(unidadeId);
        
        return ResponseEntity.ok(atendimentoService.buscarPorUnidadeEPeriodo(unidade, dataInicio, dataFim, pageable));
    }

    /**
     * Conta o número de atendimentos por unidade assistencial e período.
     * @param unidadeId ID da unidade assistencial.
     * @param dataInicio A data de início do período.
     * @param dataFim A data de fim do período.
     * @return O número de atendimentos.
     */
    @GetMapping("/unidade/{unidadeId}/periodo/contagem")
    public ResponseEntity<Long> contarPorUnidadeEPeriodo(
            @PathVariable Long unidadeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataFim) {
        // Aqui seria necessário buscar a unidade assistencial pelo ID
        // Esta implementação depende do serviço de unidades assistenciais
        UnidadeAssistencial unidade = new UnidadeAssistencial();
        unidade.setId(unidadeId);
        
        return ResponseEntity.ok(atendimentoService.contarPorUnidadeEPeriodo(unidade, dataInicio, dataFim));
    }

    /**
     * Salva um atendimentover assistencial.
     * @param atendimento Atendimento assistencial a ser salvo.
     * @param authentication Informações de autenticação do usuário.
     * @return O atendimentover assistencial salvo.
     */
    @PostMapping
    public ResponseEntity<AtendimentoAssistencial> salvar(
            @RequestBody AtendimentoAssistencial atendimento,
            Authentication authentication) {
        try {
            String usuarioCadastro = authentication.getName();
            AtendimentoAssistencial atendimentoSalvo = atendimentoService.salvar(atendimento, usuarioCadastro);
            return ResponseEntity.status(HttpStatus.CREATED).body(atendimentoSalvo);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        }
    }

    /**
     * Adiciona um paciente ao atendimentover.
     * @param id ID do atendimentover.
     * @param pacienteId ID do paciente a ser adicionado.
     * @param authentication Informações de autenticação do usuário.
     * @return O atendimentover atualizado.
     */
    @PostMapping("/{id}/pacientes/{pacienteId}")
    public ResponseEntity<AtendimentoAssistencial> adicionarPaciente(
            @PathVariable Long id,
            @PathVariable Long pacienteId,
            Authentication authentication) {
        try {
            // Aqui seria necessário buscar o paciente pelo ID
            // Esta implementação depende do serviço de pacientes
            Paciente paciente = new Paciente();
            paciente.setId(pacienteId);
            
            String usuarioAtualizacao = authentication.getName();
            return ResponseEntity.ok(atendimentoService.adicionarPaciente(id, paciente, usuarioAtualizacao));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        }
    }

    /**
     * Adiciona um profissional ao atendimentover.
     * @param id ID do atendimentover.
     * @param profissionalId ID do profissional a ser adicionado.
     * @param authentication Informações de autenticação do usuário.
     * @return O atendimentover atualizado.
     */
    @PostMapping("/{id}/profissionais/{profissionalId}")
    public ResponseEntity<AtendimentoAssistencial> adicionarProfissional(
            @PathVariable Long id,
            @PathVariable Long profissionalId,
            Authentication authentication) {
        try {
            // Aqui seria necessário buscar o profissional pelo ID
            // Esta implementação depende do serviço de profissionais
            Operador profissional = new Operador();
            profissional.setId(profissionalId);
            
            String usuarioAtualizacao = authentication.getName();
            return ResponseEntity.ok(atendimentoService.adicionarProfissional(id, profissional, usuarioAtualizacao));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    /**
     * Adiciona um motivo ao atendimentover.
     * @param id ID do atendimentover.
     * @param motivoId ID do motivo a ser adicionado.
     * @param authentication Informações de autenticação do usuário.
     * @return O atendimentover atualizado.
     */
    @PostMapping("/{id}/motivos/{motivoId}")
    public ResponseEntity<AtendimentoAssistencial> adicionarMotivo(
            @PathVariable Long id,
            @PathVariable Long motivoId,
            Authentication authentication) {
        try {
            // Aqui seria necessário buscar o motivo pelo ID
            // Esta implementação depende do serviço de motivos
            MotivoAtendimento motivo = new MotivoAtendimento();
            motivo.setId(motivoId);
            
            String usuarioAtualizacao = authentication.getName();
            return ResponseEntity.ok(atendimentoService.adicionarMotivo(id, motivo, usuarioAtualizacao));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
}
