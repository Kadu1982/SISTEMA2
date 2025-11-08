package com.sistemadesaude.backend.procedimentosrapidos.controller;

import com.sistemadesaude.backend.procedimentosrapidos.dto.*;
import com.sistemadesaude.backend.procedimentosrapidos.entity.*;
import com.sistemadesaude.backend.procedimentosrapidos.mapper.*;
import com.sistemadesaude.backend.procedimentosrapidos.service.AvaliacaoEnfermagemService;
import com.sistemadesaude.backend.paciente.repository.PacienteRepository;
import com.sistemadesaude.backend.operador.repository.OperadorRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller REST para gerenciar as escalas de avaliação de enfermagem
 */
@RestController
@RequestMapping("/api/escalas")
@Tag(name = "Escalas de Avaliação", description = "APIs para gerenciar escalas de avaliação clínica")
@RequiredArgsConstructor
@Slf4j
public class EscalasAvaliacaoController {

    private final AvaliacaoEnfermagemService avaliacaoService;
    private final EscalaMorseMapper morseMapper;
    private final EscalaBradenMapper bradenMapper;
    private final EscalaFugulinMapper fugulinMapper;
    private final EscalaGlasgowMapper glasgowMapper;
    private final EscalaEVAMapper evaMapper;
    private final PacienteRepository pacienteRepository;
    private final OperadorRepository operadorRepository;

    // ==================== ESCALA DE MORSE ====================

    @PostMapping("/morse")
    @Operation(summary = "Criar avaliação Escala de Morse", description = "Cria uma nova avaliação de risco de quedas")
    public ResponseEntity<EscalaMorseDTO> criarAvaliacaoMorse(
            @Valid @RequestBody EscalaMorseRequestDTO request) {
        log.info("Criando avaliação Morse para paciente ID: {}", request.getPacienteId());
        
        EscalaMorse morse = morseMapper.toEntity(request);
        morse.setPaciente(pacienteRepository.findById(request.getPacienteId())
                .orElseThrow(() -> new EntityNotFoundException("Paciente não encontrado")));
        morse.setAvaliador(operadorRepository.findById(request.getAvaliadorId())
                .orElseThrow(() -> new EntityNotFoundException("Avaliador não encontrado")));
        
        EscalaMorse saved = avaliacaoService.criarAvaliacaoMorse(morse);
        return ResponseEntity.status(HttpStatus.CREATED).body(morseMapper.toDTO(saved));
    }

    @GetMapping("/morse/paciente/{pacienteId}")
    @Operation(summary = "Listar avaliações Morse por paciente", description = "Retorna todas as avaliações Morse de um paciente")
    public ResponseEntity<List<EscalaMorseDTO>> listarAvaliacoesMorse(@PathVariable Long pacienteId) {
        log.info("Buscando avaliações Morse para paciente ID: {}", pacienteId);
        List<EscalaMorse> avaliacoes = avaliacaoService.buscarAvaliacoesMorsePorPaciente(pacienteId);
        return ResponseEntity.ok(morseMapper.toDTOList(avaliacoes));
    }

    // ==================== ESCALA DE BRADEN ====================

    @PostMapping("/braden")
    @Operation(summary = "Criar avaliação Escala de Braden", description = "Cria uma nova avaliação de risco de lesão por pressão")
    public ResponseEntity<EscalaBradenDTO> criarAvaliacaoBraden(
            @Valid @RequestBody EscalaBradenRequestDTO request) {
        log.info("Criando avaliação Braden para paciente ID: {}", request.getPacienteId());
        
        EscalaBraden braden = bradenMapper.toEntity(request);
        braden.setPaciente(pacienteRepository.findById(request.getPacienteId())
                .orElseThrow(() -> new EntityNotFoundException("Paciente não encontrado")));
        braden.setAvaliador(operadorRepository.findById(request.getAvaliadorId())
                .orElseThrow(() -> new EntityNotFoundException("Avaliador não encontrado")));
        
        EscalaBraden saved = avaliacaoService.criarAvaliacaoBraden(braden);
        return ResponseEntity.status(HttpStatus.CREATED).body(bradenMapper.toDTO(saved));
    }

    @GetMapping("/braden/paciente/{pacienteId}")
    @Operation(summary = "Listar avaliações Braden por paciente", description = "Retorna todas as avaliações Braden de um paciente")
    public ResponseEntity<List<EscalaBradenDTO>> listarAvaliacoesBraden(@PathVariable Long pacienteId) {
        log.info("Buscando avaliações Braden para paciente ID: {}", pacienteId);
        List<EscalaBraden> avaliacoes = avaliacaoService.buscarAvaliacoesBradenPorPaciente(pacienteId);
        return ResponseEntity.ok(bradenMapper.toDTOList(avaliacoes));
    }

    // ==================== ESCALA DE FUGULIN ====================

    @PostMapping("/fugulin")
    @Operation(summary = "Criar avaliação Escala de Fugulin", description = "Cria uma nova avaliação de carga de trabalho")
    public ResponseEntity<EscalaFugulinDTO> criarAvaliacaoFugulin(
            @Valid @RequestBody EscalaFugulinRequestDTO request) {
        log.info("Criando avaliação Fugulin para paciente ID: {}", request.getPacienteId());
        
        EscalaFugulin fugulin = fugulinMapper.toEntity(request);
        fugulin.setPaciente(pacienteRepository.findById(request.getPacienteId())
                .orElseThrow(() -> new EntityNotFoundException("Paciente não encontrado")));
        fugulin.setAvaliador(operadorRepository.findById(request.getAvaliadorId())
                .orElseThrow(() -> new EntityNotFoundException("Avaliador não encontrado")));
        
        EscalaFugulin saved = avaliacaoService.criarAvaliacaoFugulin(fugulin);
        return ResponseEntity.status(HttpStatus.CREATED).body(fugulinMapper.toDTO(saved));
    }

    @GetMapping("/fugulin/paciente/{pacienteId}")
    @Operation(summary = "Listar avaliações Fugulin por paciente", description = "Retorna todas as avaliações Fugulin de um paciente")
    public ResponseEntity<List<EscalaFugulinDTO>> listarAvaliacoesFugulin(@PathVariable Long pacienteId) {
        log.info("Buscando avaliações Fugulin para paciente ID: {}", pacienteId);
        List<EscalaFugulin> avaliacoes = avaliacaoService.buscarAvaliacoesFugulinPorPaciente(pacienteId);
        return ResponseEntity.ok(fugulinMapper.toDTOList(avaliacoes));
    }

    // ==================== ESCALA DE GLASGOW ====================

    @PostMapping("/glasgow")
    @Operation(summary = "Criar avaliação Escala de Glasgow", description = "Cria uma nova avaliação de nível de consciência")
    public ResponseEntity<EscalaGlasgowDTO> criarAvaliacaoGlasgow(
            @Valid @RequestBody EscalaGlasgowRequestDTO request) {
        log.info("Criando avaliação Glasgow para paciente ID: {}", request.getPacienteId());
        
        EscalaGlasgow glasgow = glasgowMapper.toEntity(request);
        glasgow.setPaciente(pacienteRepository.findById(request.getPacienteId())
                .orElseThrow(() -> new EntityNotFoundException("Paciente não encontrado")));
        glasgow.setAvaliador(operadorRepository.findById(request.getAvaliadorId())
                .orElseThrow(() -> new EntityNotFoundException("Avaliador não encontrado")));
        
        EscalaGlasgow saved = avaliacaoService.criarAvaliacaoGlasgow(glasgow);
        return ResponseEntity.status(HttpStatus.CREATED).body(glasgowMapper.toDTO(saved));
    }

    @GetMapping("/glasgow/paciente/{pacienteId}")
    @Operation(summary = "Listar avaliações Glasgow por paciente", description = "Retorna todas as avaliações Glasgow de um paciente")
    public ResponseEntity<List<EscalaGlasgowDTO>> listarAvaliacoesGlasgow(@PathVariable Long pacienteId) {
        log.info("Buscando avaliações Glasgow para paciente ID: {}", pacienteId);
        List<EscalaGlasgow> avaliacoes = avaliacaoService.buscarAvaliacoesGlasgowPorPaciente(pacienteId);
        return ResponseEntity.ok(glasgowMapper.toDTOList(avaliacoes));
    }

    // ==================== ESCALA EVA ====================

    @PostMapping("/eva")
    @Operation(summary = "Criar avaliação Escala EVA", description = "Cria uma nova avaliação de dor")
    public ResponseEntity<EscalaEVADTO> criarAvaliacaoEVA(
            @Valid @RequestBody EscalaEVARequestDTO request) {
        log.info("Criando avaliação EVA para paciente ID: {}", request.getPacienteId());
        
        EscalaEVA eva = evaMapper.toEntity(request);
        eva.setPaciente(pacienteRepository.findById(request.getPacienteId())
                .orElseThrow(() -> new EntityNotFoundException("Paciente não encontrado")));
        eva.setAvaliador(operadorRepository.findById(request.getAvaliadorId())
                .orElseThrow(() -> new EntityNotFoundException("Avaliador não encontrado")));
        
        EscalaEVA saved = avaliacaoService.criarAvaliacaoEVA(eva);
        return ResponseEntity.status(HttpStatus.CREATED).body(evaMapper.toDTO(saved));
    }

    @GetMapping("/eva/paciente/{pacienteId}")
    @Operation(summary = "Listar avaliações EVA por paciente", description = "Retorna todas as avaliações EVA de um paciente")
    public ResponseEntity<List<EscalaEVADTO>> listarAvaliacoesEVA(@PathVariable Long pacienteId) {
        log.info("Buscando avaliações EVA para paciente ID: {}", pacienteId);
        List<EscalaEVA> avaliacoes = avaliacaoService.buscarAvaliacoesEVAPorPaciente(pacienteId);
        return ResponseEntity.ok(evaMapper.toDTOList(avaliacoes));
    }

    // ==================== ENDPOINTS AGREGADOS ====================

    @GetMapping("/paciente/{pacienteId}/historico")
    @Operation(summary = "Buscar histórico completo", description = "Retorna todas as avaliações de todas as escalas de um paciente")
    public ResponseEntity<Map<String, Object>> buscarHistoricoCompleto(@PathVariable Long pacienteId) {
        log.info("Buscando histórico completo para paciente ID: {}", pacienteId);
        
        Map<String, Object> historico = avaliacaoService.buscarHistoricoCompleto(pacienteId);
        
        // Converter para DTOs
        historico.put("morse", morseMapper.toDTOList((List<EscalaMorse>) historico.get("morse")));
        historico.put("braden", bradenMapper.toDTOList((List<EscalaBraden>) historico.get("braden")));
        historico.put("fugulin", fugulinMapper.toDTOList((List<EscalaFugulin>) historico.get("fugulin")));
        historico.put("glasgow", glasgowMapper.toDTOList((List<EscalaGlasgow>) historico.get("glasgow")));
        historico.put("eva", evaMapper.toDTOList((List<EscalaEVA>) historico.get("eva")));
        
        return ResponseEntity.ok(historico);
    }

    @GetMapping("/paciente/{pacienteId}/resumo")
    @Operation(summary = "Buscar resumo de avaliações", description = "Retorna um resumo das últimas avaliações de cada escala")
    public ResponseEntity<Map<String, Object>> buscarResumoAvaliacoes(@PathVariable Long pacienteId) {
        log.info("Buscando resumo de avaliações para paciente ID: {}", pacienteId);
        Map<String, Object> resumo = avaliacaoService.buscarResumoAvaliacoes(pacienteId);
        return ResponseEntity.ok(resumo);
    }
}