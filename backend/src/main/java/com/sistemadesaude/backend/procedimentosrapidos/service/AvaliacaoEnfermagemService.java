package com.sistemadesaude.backend.procedimentosrapidos.service;

import com.sistemadesaude.backend.procedimentosrapidos.entity.*;
import com.sistemadesaude.backend.procedimentosrapidos.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Service para orquestrar as avaliações de enfermagem
 * Gerencia as 5 escalas: Morse, Braden, Fugulin, Glasgow e EVA
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AvaliacaoEnfermagemService {

    private final EscalaMorseRepository morseRepository;
    private final EscalaBradenRepository bradenRepository;
    private final EscalaFugulinRepository fugulinRepository;
    private final EscalaGlasgowRepository glasgowRepository;
    private final EscalaEVARepository evaRepository;

    // ==================== ESCALA DE MORSE ====================

    @Transactional
    public EscalaMorse criarAvaliacaoMorse(EscalaMorse morse) {
        log.info("Criando avaliação Morse para paciente ID: {}", morse.getPaciente().getId());
        validarAvaliacaoMorse(morse);
        // O cálculo é automático via @PrePersist na entidade
        return morseRepository.save(morse);
    }

    public List<EscalaMorse> buscarAvaliacoesMorsePorPaciente(Long pacienteId) {
        log.info("Buscando avaliações Morse para paciente ID: {}", pacienteId);
        return morseRepository.findByPacienteIdOrderByDataAvaliacaoDesc(pacienteId);
    }

    public Optional<EscalaMorse> buscarUltimaAvaliacaoMorse(Long pacienteId) {
        log.info("Buscando última avaliação Morse para paciente ID: {}", pacienteId);
        return morseRepository.findFirstByPacienteIdOrderByDataAvaliacaoDesc(pacienteId);
    }

    private void validarAvaliacaoMorse(EscalaMorse morse) {
        if (morse.getPaciente() == null) {
            throw new IllegalArgumentException("Paciente é obrigatório");
        }
        if (morse.getAvaliador() == null) {
            throw new IllegalArgumentException("Avaliador é obrigatório");
        }
        if (morse.getDataAvaliacao() == null) {
            morse.setDataAvaliacao(LocalDateTime.now());
        }
    }

    // ==================== ESCALA DE BRADEN ====================

    @Transactional
    public EscalaBraden criarAvaliacaoBraden(EscalaBraden braden) {
        log.info("Criando avaliação Braden para paciente ID: {}", braden.getPaciente().getId());
        validarAvaliacaoBraden(braden);
        // O cálculo é automático via @PrePersist na entidade
        return bradenRepository.save(braden);
    }

    public List<EscalaBraden> buscarAvaliacoesBradenPorPaciente(Long pacienteId) {
        log.info("Buscando avaliações Braden para paciente ID: {}", pacienteId);
        return bradenRepository.findByPacienteIdOrderByDataAvaliacaoDesc(pacienteId);
    }

    public Optional<EscalaBraden> buscarUltimaAvaliacaoBraden(Long pacienteId) {
        log.info("Buscando última avaliação Braden para paciente ID: {}", pacienteId);
        return bradenRepository.findFirstByPacienteIdOrderByDataAvaliacaoDesc(pacienteId);
    }

    private void validarAvaliacaoBraden(EscalaBraden braden) {
        if (braden.getPaciente() == null) {
            throw new IllegalArgumentException("Paciente é obrigatório");
        }
        if (braden.getAvaliador() == null) {
            throw new IllegalArgumentException("Avaliador é obrigatório");
        }
        if (braden.getDataAvaliacao() == null) {
            braden.setDataAvaliacao(LocalDateTime.now());
        }
    }

    // ==================== ESCALA DE FUGULIN ====================

    @Transactional
    public EscalaFugulin criarAvaliacaoFugulin(EscalaFugulin fugulin) {
        log.info("Criando avaliação Fugulin para paciente ID: {}", fugulin.getPaciente().getId());
        validarAvaliacaoFugulin(fugulin);
        // O cálculo é automático via @PrePersist na entidade
        return fugulinRepository.save(fugulin);
    }

    public List<EscalaFugulin> buscarAvaliacoesFugulinPorPaciente(Long pacienteId) {
        log.info("Buscando avaliações Fugulin para paciente ID: {}", pacienteId);
        return fugulinRepository.findByPacienteIdOrderByDataAvaliacaoDesc(pacienteId);
    }

    public Optional<EscalaFugulin> buscarUltimaAvaliacaoFugulin(Long pacienteId) {
        log.info("Buscando última avaliação Fugulin para paciente ID: {}", pacienteId);
        return fugulinRepository.findFirstByPacienteIdOrderByDataAvaliacaoDesc(pacienteId);
    }

    private void validarAvaliacaoFugulin(EscalaFugulin fugulin) {
        if (fugulin.getPaciente() == null) {
            throw new IllegalArgumentException("Paciente é obrigatório");
        }
        if (fugulin.getAvaliador() == null) {
            throw new IllegalArgumentException("Avaliador é obrigatório");
        }
        if (fugulin.getDataAvaliacao() == null) {
            fugulin.setDataAvaliacao(LocalDateTime.now());
        }
    }

    // ==================== ESCALA DE GLASGOW ====================

    @Transactional
    public EscalaGlasgow criarAvaliacaoGlasgow(EscalaGlasgow glasgow) {
        log.info("Criando avaliação Glasgow para paciente ID: {}", glasgow.getPaciente().getId());
        validarAvaliacaoGlasgow(glasgow);
        // O cálculo é automático via @PrePersist na entidade
        return glasgowRepository.save(glasgow);
    }

    public List<EscalaGlasgow> buscarAvaliacoesGlasgowPorPaciente(Long pacienteId) {
        log.info("Buscando avaliações Glasgow para paciente ID: {}", pacienteId);
        return glasgowRepository.findByPacienteIdOrderByDataAvaliacaoDesc(pacienteId);
    }

    public Optional<EscalaGlasgow> buscarUltimaAvaliacaoGlasgow(Long pacienteId) {
        log.info("Buscando última avaliação Glasgow para paciente ID: {}", pacienteId);
        return glasgowRepository.findFirstByPacienteIdOrderByDataAvaliacaoDesc(pacienteId);
    }

    private void validarAvaliacaoGlasgow(EscalaGlasgow glasgow) {
        if (glasgow.getPaciente() == null) {
            throw new IllegalArgumentException("Paciente é obrigatório");
        }
        if (glasgow.getAvaliador() == null) {
            throw new IllegalArgumentException("Avaliador é obrigatório");
        }
        if (glasgow.getDataAvaliacao() == null) {
            glasgow.setDataAvaliacao(LocalDateTime.now());
        }
    }

    // ==================== ESCALA EVA ====================

    @Transactional
    public EscalaEVA criarAvaliacaoEVA(EscalaEVA eva) {
        log.info("Criando avaliação EVA para paciente ID: {}", eva.getPaciente().getId());
        validarAvaliacaoEVA(eva);
        // O cálculo é automático via @PrePersist na entidade
        return evaRepository.save(eva);
    }

    public List<EscalaEVA> buscarAvaliacoesEVAPorPaciente(Long pacienteId) {
        log.info("Buscando avaliações EVA para paciente ID: {}", pacienteId);
        return evaRepository.findByPacienteIdOrderByDataAvaliacaoDesc(pacienteId);
    }

    public Optional<EscalaEVA> buscarUltimaAvaliacaoEVA(Long pacienteId) {
        log.info("Buscando última avaliação EVA para paciente ID: {}", pacienteId);
        return evaRepository.findFirstByPacienteIdOrderByDataAvaliacaoDesc(pacienteId);
    }

    private void validarAvaliacaoEVA(EscalaEVA eva) {
        if (eva.getPaciente() == null) {
            throw new IllegalArgumentException("Paciente é obrigatório");
        }
        if (eva.getAvaliador() == null) {
            throw new IllegalArgumentException("Avaliador é obrigatório");
        }
        if (eva.getDataAvaliacao() == null) {
            eva.setDataAvaliacao(LocalDateTime.now());
        }
    }

    // ==================== HISTÓRICO COMPLETO ====================

    /**
     * Busca histórico completo de todas as avaliações de um paciente
     */
    public Map<String, Object> buscarHistoricoCompleto(Long pacienteId) {
        log.info("Buscando histórico completo para paciente ID: {}", pacienteId);
        
        Map<String, Object> historico = new HashMap<>();
        historico.put("morse", morseRepository.findByPacienteIdOrderByDataAvaliacaoDesc(pacienteId));
        historico.put("braden", bradenRepository.findByPacienteIdOrderByDataAvaliacaoDesc(pacienteId));
        historico.put("fugulin", fugulinRepository.findByPacienteIdOrderByDataAvaliacaoDesc(pacienteId));
        historico.put("glasgow", glasgowRepository.findByPacienteIdOrderByDataAvaliacaoDesc(pacienteId));
        historico.put("eva", evaRepository.findByPacienteIdOrderByDataAvaliacaoDesc(pacienteId));
        
        return historico;
    }

    /**
     * Busca resumo das últimas avaliações de um paciente
     */
    public Map<String, Object> buscarResumoAvaliacoes(Long pacienteId) {
        log.info("Buscando resumo de avaliações para paciente ID: {}", pacienteId);
        
        Map<String, Object> resumo = new HashMap<>();
        
        buscarUltimaAvaliacaoMorse(pacienteId).ifPresent(m -> 
            resumo.put("morse", Map.of(
                "pontuacao", m.getPontuacaoTotal(),
                "classificacao", m.getClassificacaoRisco(),
                "data", m.getDataAvaliacao()
            ))
        );
        
        buscarUltimaAvaliacaoBraden(pacienteId).ifPresent(b -> 
            resumo.put("braden", Map.of(
                "pontuacao", b.getPontuacaoTotal(),
                "classificacao", b.getClassificacaoRisco(),
                "data", b.getDataAvaliacao()
            ))
        );
        
        buscarUltimaAvaliacaoFugulin(pacienteId).ifPresent(f -> 
            resumo.put("fugulin", Map.of(
                "pontuacao", f.getPontuacaoTotal(),
                "classificacao", f.getClassificacaoCuidado(),
                "data", f.getDataAvaliacao()
            ))
        );
        
        buscarUltimaAvaliacaoGlasgow(pacienteId).ifPresent(g -> 
            resumo.put("glasgow", Map.of(
                "pontuacao", g.getPontuacaoTotal(),
                "classificacao", g.getClassificacaoNivelConsciencia(),
                "data", g.getDataAvaliacao()
            ))
        );
        
        buscarUltimaAvaliacaoEVA(pacienteId).ifPresent(e -> 
            resumo.put("eva", Map.of(
                "pontuacao", e.getPontuacaoDor(),
                "classificacao", e.getClassificacaoDor(),
                "data", e.getDataAvaliacao()
            ))
        );
        
        return resumo;
    }

    /**
     * Busca pacientes com riscos elevados em todas as escalas
     */
    public Map<String, List<?>> buscarPacientesComRiscoElevado() {
        log.info("Buscando pacientes com risco elevado");
        
        Map<String, List<?>> riscos = new HashMap<>();
        riscos.put("morse_alto_risco", morseRepository.findPacientesComRiscoElevado());
        riscos.put("braden_muito_alto_risco", bradenRepository.findPacientesComRiscoMuitoAlto());
        riscos.put("fugulin_cuidado_intensivo", fugulinRepository.findPacientesComCuidadoIntensivo());
        riscos.put("glasgow_grave", glasgowRepository.findPacientesComGlasgowGrave());
        riscos.put("eva_dor_intensa", evaRepository.findPacientesComDorIntensa());
        
        return riscos;
    }
}