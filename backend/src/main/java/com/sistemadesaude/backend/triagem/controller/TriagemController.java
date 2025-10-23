package com.sistemadesaude.backend.triagem.controller;

import com.sistemadesaude.backend.triagem.dto.CriarTriagemRequestDTO;
import com.sistemadesaude.backend.triagem.dto.PacienteAguardandoTriagemDTO;
import com.sistemadesaude.backend.triagem.dto.PacienteTriadoDTO;
import com.sistemadesaude.backend.triagem.entity.ProtocoloMinisterioSaude;
import com.sistemadesaude.backend.triagem.entity.Triagem;
import com.sistemadesaude.backend.triagem.service.TriagemService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 🩺 CONTROLLER DE TRIAGEM COM PROTOCOLOS INTELIGENTES
 *
 * ✅ FUNCIONALIDADES:
 * - Gestão completa de triagem
 * - Análise prévia de queixas com protocolos
 * - Estatísticas de protocolos aplicados
 * - Listagem de protocolos disponíveis
 * - ✅ NOVO: Suporte para filtro por data e calendário com indicadores
 */
@RestController
@RequestMapping("/api/triagem")
@RequiredArgsConstructor
@Validated
public class TriagemController {

    private final TriagemService triagemService;

    // ========================================
    // 📋 ENDPOINTS BÁSICOS DE TRIAGEM
    // ========================================

    /**
     * 📋 Busca pacientes aguardando triagem com filtro por data
     */
    @GetMapping("/aguardando")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PacienteAguardandoTriagemDTO>> listarPacientesAguardando(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataReferencia) {
        try {
            List<PacienteAguardandoTriagemDTO> pacientes = triagemService.findPacientesAguardandoTriagem(dataReferencia);
            return ResponseEntity.ok(pacientes);
        } catch (Exception e) {
            // Evitar 400/500 e manter UI funcionando com lista vazia
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    /**
     * ✅ NOVO: Busca datas que têm pacientes recepcionados aguardando triagem
     */
    @GetMapping("/datas-com-recepcionados")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> buscarDatasComPacientesRecepcionados() {
        try {
            List<Map<String, Object>> datasComQuantidade = triagemService.buscarDatasComPacientesRecepcionados();
            return ResponseEntity.ok(datasComQuantidade);
        } catch (Exception e) {
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    @GetMapping("/triados")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PacienteTriadoDTO>> listarPacientesTriados() {
        try {
            List<PacienteTriadoDTO> pacientes = triagemService.findPacientesTriados();
            return ResponseEntity.ok(pacientes);
        } catch (Exception e) {
            // Evitar 400/500 e manter UI funcionando com lista vazia
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> salvarTriagem(@RequestBody @Valid CriarTriagemRequestDTO request) {
        triagemService.salvarTriagem(request);
        return ResponseEntity.created(null).build();
    }

    @DeleteMapping("/{triagemId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> cancelarTriagem(@PathVariable @Min(1) Long triagemId) {
        triagemService.cancelarTriagem(triagemId);
        return ResponseEntity.noContent().build();
    }

    // ========================================
    // 🧠 ENDPOINTS INTELIGENTES PARA PROTOCOLOS
    // ========================================

    /**
     * 🧠 ANÁLISE PRÉVIA DE QUEIXA
     *
     * Permite analisar uma queixa antes de salvar a triagem,
     * mostrando quais protocolos podem ser aplicados.
     */
    @PostMapping("/analisar-queixa")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> analisarQueixa(@RequestBody Map<String, Object> request) {
        try {
            String queixa = (String) request.get("queixa");
            Double temperatura = (Double) request.get("temperatura");
            Integer saturacao = (Integer) request.get("saturacaoOxigenio");
            String pressaoArterial = (String) request.get("pressaoArterial");

            // Usar diretamente o enum para análise
            ProtocoloMinisterioSaude protocolo = ProtocoloMinisterioSaude
                    .analisarQueixa(queixa, temperatura, saturacao, pressaoArterial);

            Map<String, Object> response = new HashMap<>();

            if (protocolo != null) {
                response.put("protocoloEncontrado", true);
                response.put("nomeProtocolo", protocolo.getNome());
                response.put("classificacaoSugerida", protocolo.getClassificacaoSugerida());
                response.put("condutaSugerida", protocolo.getCondutaSugerida());
                response.put("diagnosticosSugeridos", protocolo.getDiagnosticosSugeridos());
                response.put("criteriosClinicos", protocolo.getCriteriosClirnicos());
            } else {
                response.put("protocoloEncontrado", false);
                response.put("mensagem", "Nenhum protocolo específico identificado. Prosseguir com classificação manual.");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = Map.of(
                    "erro", true,
                    "mensagem", "Erro ao analisar queixa: " + e.getMessage()
            );
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * 📋 LISTAR TODOS OS PROTOCOLOS DISPONÍVEIS
     */
    @GetMapping("/protocolos")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> listarProtocolos() {
        List<Map<String, Object>> protocolos = Arrays.stream(ProtocoloMinisterioSaude.values())
                .map(protocolo -> {
                    Map<String, Object> protocoloInfo = new HashMap<>();
                    protocoloInfo.put("codigo", protocolo.name());
                    protocoloInfo.put("nome", protocolo.getNome());
                    protocoloInfo.put("classificacaoSugerida", protocolo.getClassificacaoSugerida());
                    protocoloInfo.put("palavrasChave", protocolo.getPalavrasChave());
                    protocoloInfo.put("criteriosClinicos", protocolo.getCriteriosClirnicos());
                    return protocoloInfo;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(protocolos);
    }

    /**
     * 📊 ESTATÍSTICAS DE PROTOCOLOS APLICADOS
     */
    @GetMapping("/estatisticas/protocolos")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> estatisticasProtocolos(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime dataInicio,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime dataFim) {

        // Se não especificado, usar últimos 30 dias
        if (dataInicio == null) {
            dataInicio = LocalDateTime.now().minusDays(30);
        }
        if (dataFim == null) {
            dataFim = LocalDateTime.now();
        }

        // Buscar triagens no período
        List<Triagem> triagens = triagemService.buscarTriagensNoPeriodo(dataInicio, dataFim);

        // Calcular estatísticas de protocolos aplicados
        Map<String, Long> protocolosAplicados = triagens.stream()
                .filter(t -> t.getProtocoloAplicado() != null)
                .collect(Collectors.groupingBy(
                        Triagem::getProtocoloAplicado,
                        Collectors.counting()
                ));

        long totalTriagens = triagens.size();
        long triagensComProtocolo = triagens.stream()
                .mapToLong(t -> t.getProtocoloAplicado() != null ? 1 : 0)
                .sum();

        long triagensReclassificadas = triagens.stream()
                .mapToLong(t -> t.foiReclassificada() ? 1 : 0)
                .sum();

        // Montar resposta com estatísticas
        Map<String, Object> estatisticas = new HashMap<>();
        estatisticas.put("totalTriagens", totalTriagens);
        estatisticas.put("triagensComProtocolo", triagensComProtocolo);
        estatisticas.put("triagensReclassificadas", triagensReclassificadas);
        estatisticas.put("percentualComProtocolo",
                totalTriagens > 0 ? (triagensComProtocolo * 100.0 / totalTriagens) : 0);
        estatisticas.put("percentualReclassificadas",
                totalTriagens > 0 ? (triagensReclassificadas * 100.0 / totalTriagens) : 0);
        estatisticas.put("protocolosAplicados", protocolosAplicados);

        // Adicionar detalhes por protocolo
        Map<String, Object> detalhesProtocolos = new HashMap<>();
        for (ProtocoloMinisterioSaude protocolo : ProtocoloMinisterioSaude.values()) {
            long count = triagens.stream()
                    .filter(t -> t.getProtocoloAplicado() != null &&
                            t.getProtocoloAplicado().contains(protocolo.name()))
                    .count();

            if (count > 0) {
                Map<String, Object> detalhe = new HashMap<>();
                detalhe.put("nome", protocolo.getNome());
                detalhe.put("quantidade", count);
                detalhe.put("percentual", totalTriagens > 0 ? (count * 100.0 / totalTriagens) : 0);
                detalhe.put("classificacaoSugerida", protocolo.getClassificacaoSugerida());
                detalhesProtocolos.put(protocolo.name(), detalhe);
            }
        }
        estatisticas.put("detalhesProtocolos", detalhesProtocolos);

        return ResponseEntity.ok(estatisticas);
    }

    /**
     * 🔍 BUSCAR TRIAGENS COM PROTOCOLO ESPECÍFICO
     */
    @GetMapping("/protocolos/{protocoloNome}/triagens")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> buscarTriagensPorProtocolo(
            @PathVariable String protocoloNome,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime dataInicio,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime dataFim) {

        // Se não especificado, usar últimos 7 dias
        if (dataInicio == null) {
            dataInicio = LocalDateTime.now().minusDays(7);
        }
        if (dataFim == null) {
            dataFim = LocalDateTime.now();
        }

        List<Triagem> triagens = triagemService.buscarTriagensNoPeriodo(dataInicio, dataFim);

        List<Map<String, Object>> triagensComProtocolo = triagens.stream()
                .filter(t -> t.getProtocoloAplicado() != null &&
                        t.getProtocoloAplicado().toUpperCase().contains(protocoloNome.toUpperCase()))
                .map(t -> {
                    Map<String, Object> info = new HashMap<>();
                    info.put("triagemId", t.getId());
                    info.put("pacienteNome", t.getPaciente().getNomeCompleto());
                    info.put("dataTriagem", t.getDataTriagem());
                    info.put("queixaPrincipal", t.getQueixaPrincipal());
                    info.put("classificacaoOriginal", t.getClassificacaoOriginal());
                    info.put("classificacaoFinal", t.getClassificacaoRisco());
                    info.put("foiReclassificada", t.foiReclassificada());
                    info.put("protocoloAplicado", t.getProtocoloAplicado());
                    info.put("condutaSugerida", t.getCondutaSugerida());
                    return info;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(triagensComProtocolo);
    }

    /**
     * 📊 DASHBOARD DE PROTOCOLOS - RESUMO EXECUTIVO
     */
    @GetMapping("/dashboard/protocolos")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> dashboardProtocolos() {
        LocalDateTime inicioHoje = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime fimHoje = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);
        LocalDateTime inicioSemana = LocalDateTime.now().minusDays(7);
        LocalDateTime inicioMes = LocalDateTime.now().minusDays(30);

        Map<String, Object> dashboard = new HashMap<>();

        // Estatísticas do dia
        List<Triagem> triagensHoje = triagemService.buscarTriagensNoPeriodo(inicioHoje, fimHoje);
        long triagensComProtocoloHoje = triagensHoje.stream()
                .mapToLong(t -> t.getProtocoloAplicado() != null ? 1 : 0)
                .sum();

        // Estatísticas da semana
        List<Triagem> triagensSemana = triagemService.buscarTriagensNoPeriodo(inicioSemana, LocalDateTime.now());
        long triagensComProtocoloSemana = triagensSemana.stream()
                .mapToLong(t -> t.getProtocoloAplicado() != null ? 1 : 0)
                .sum();

        // Estatísticas do mês
        List<Triagem> triagensMes = triagemService.buscarTriagensNoPeriodo(inicioMes, LocalDateTime.now());
        long triagensComProtocoloMes = triagensMes.stream()
                .mapToLong(t -> t.getProtocoloAplicado() != null ? 1 : 0)
                .sum();

        // Montar dashboard
        Map<String, Object> resumoHoje = new HashMap<>();
        resumoHoje.put("totalTriagens", triagensHoje.size());
        resumoHoje.put("comProtocolo", triagensComProtocoloHoje);
        resumoHoje.put("percentual", triagensHoje.size() > 0 ?
                (triagensComProtocoloHoje * 100.0 / triagensHoje.size()) : 0);

        Map<String, Object> resumoSemana = new HashMap<>();
        resumoSemana.put("totalTriagens", triagensSemana.size());
        resumoSemana.put("comProtocolo", triagensComProtocoloSemana);
        resumoSemana.put("percentual", triagensSemana.size() > 0 ?
                (triagensComProtocoloSemana * 100.0 / triagensSemana.size()) : 0);

        Map<String, Object> resumoMes = new HashMap<>();
        resumoMes.put("totalTriagens", triagensMes.size());
        resumoMes.put("comProtocolo", triagensComProtocoloMes);
        resumoMes.put("percentual", triagensMes.size() > 0 ?
                (triagensComProtocoloMes * 100.0 / triagensMes.size()) : 0);

        dashboard.put("hoje", resumoHoje);
        dashboard.put("semana", resumoSemana);
        dashboard.put("mes", resumoMes);

        // Top 5 protocolos mais usados no mês
        Map<String, Long> topProtocolos = triagensMes.stream()
                .filter(t -> t.getProtocoloAplicado() != null)
                .collect(Collectors.groupingBy(
                        Triagem::getProtocoloAplicado,
                        Collectors.counting()
                ))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        LinkedHashMap::new
                ));

        dashboard.put("topProtocolos", topProtocolos);

        return ResponseEntity.ok(dashboard);
    }
}