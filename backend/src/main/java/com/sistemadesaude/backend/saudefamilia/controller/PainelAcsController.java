package com.sistemadesaude.backend.saudefamilia.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/saude-familia/painel")
@RequiredArgsConstructor
public class PainelAcsController {

    // >>> Altere de 'ADMIN_SISTEMA' para 'ADMINISTRADOR_SISTEMA' conforme a migration V3__Insert_Operador_Master.sql
    @GetMapping("/test")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR_SISTEMA','GESTOR_AB','ACS')")
    public ResponseEntity<Map<String, Object>> test() {
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "message", "PainelAcsController funcionando!",
                "timestamp", java.time.LocalDateTime.now().toString()
        ));
    }

    @GetMapping("/mapa/areas")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR_SISTEMA','GESTOR_AB','ACS')")
    public ResponseEntity<Map<String, Object>> mapaAreas() {
        return ResponseEntity.ok(Map.of(
                "areas", List.of(
                        Map.of("id", 1, "descricao", "Área 01", "ine", "0000001", "centroid", Map.of("lat", -23.55, "lng", -46.63)),
                        Map.of("id", 2, "descricao", "Área 02", "ine", "0000002", "centroid", Map.of("lat", -23.57, "lng", -46.65))
                )
        ));
    }

    @GetMapping("/rastreabilidade")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR_SISTEMA','GESTOR_AB','ACS')")
    public ResponseEntity<Map<String, Object>> rastreabilidade(@RequestParam Long profissionalId,
                                                               @RequestParam String inicio,
                                                               @RequestParam String fim) {
        return ResponseEntity.ok(Map.of(
                "profissionalId", profissionalId,
                "inicio", inicio,
                "fim", fim,
                "rota", List.of(
                        Map.of("lat", -23.55, "lng", -46.63, "dataHora", LocalDate.now().toString()),
                        Map.of("lat", -23.56, "lng", -46.64, "dataHora", LocalDate.now().toString())
                ),
                "visitas", List.of(
                        Map.of("id", 101, "lat", -23.551, "lng", -46.631, "desfecho", "REALIZADA"),
                        Map.of("id", 102, "lat", -23.562, "lng", -46.642, "desfecho", "RECUSADA")
                )
        ));
    }

    @GetMapping("/visao-geral")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR_SISTEMA','GESTOR_AB','ACS')")
    public ResponseEntity<Map<String, Object>> visaoGeral() {
        return ResponseEntity.ok(Map.of(
                "usuariosPorArea", List.of(
                        Map.of("area", "Área 01", "total", 1200),
                        Map.of("area", "Área 02", "total", 980)
                ),
                "usuariosPorMicroarea", List.of(
                        Map.of("microarea", "01", "total", 300),
                        Map.of("microarea", "02", "total", 280)
                ),
                "visitas12Meses", List.of(50, 45, 48, 60, 62, 58, 55, 70, 65, 68, 72, 80)
        ));
    }

    @GetMapping("/metas")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR_SISTEMA','GESTOR_AB','ACS')")
    public ResponseEntity<Map<String, Object>> metasResumo() {
        return ResponseEntity.ok(Map.of(
                "familias", Map.of("meta", 300, "realizado", 240),
                "integrantes", Map.of("meta", 900, "realizado", 720),
                "acompanhamento", Map.of("meta", 120, "realizado", 95)
        ));
    }

    @GetMapping("/info-gerais")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR_SISTEMA','GESTOR_AB','ACS')")
    public ResponseEntity<Map<String, Object>> infoGerais() {
        return ResponseEntity.ok(Map.of(
                "integrantesVisitados", 540,
                "motivosVisita", Map.of("CADASTRO", 120, "ACOMPANHAMENTO", 300, "BUSCA_ATIVA", 120),
                "buscaAtiva", 35,
                "desfechoVisitas", Map.of("REALIZADA", 420, "RECUSADA", 50, "NAO_ENCONTRADO", 70),
                "evolucaoGestHiperDiab", List.of(5, 6, 7, 8, 10, 12, 12, 13, 14, 15, 15, 16)
        ));
    }

    @GetMapping("/detalhamento")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR_SISTEMA','GESTOR_AB','ACS')")
    public ResponseEntity<Map<String, Object>> detalhamento(@RequestParam(required = false) Long areaId,
                                                            @RequestParam(required = false) Long microareaId,
                                                            @RequestParam(required = false) Long profissionalId,
                                                            @RequestParam String inicio,
                                                            @RequestParam String fim) {
        return ResponseEntity.ok(Map.of(
                "filtros", Map.of(
                        "areaId", areaId,
                        "microareaId", microareaId,
                        "profissionalId", profissionalId,
                        "inicio", inicio,
                        "fim", fim
                ),
                "lista", List.of(
                        Map.of("id", 1001, "dataHora", inicio, "areaId", 1, "microareaId", 1, "profissionalId", 10, "desfecho", "REALIZADA"),
                        Map.of("id", 1002, "dataHora", fim, "areaId", 1, "microareaId", 2, "profissionalId", 11, "desfecho", "RECUSADA")
                ),
                "pontos", List.of(
                        Map.of("id", 1001, "lat", -23.551, "lng", -46.631),
                        Map.of("id", 1002, "lat", -23.562, "lng", -46.642)
                )
        ));
    }

    @GetMapping("/acompanhamento")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR_SISTEMA','GESTOR_AB','ACS')")
    public ResponseEntity<Map<String, Object>> acompanhamento(@RequestParam String tipo) {
        return ResponseEntity.ok(Map.of(
                "tipo", tipo,
                "pontos", List.of(
                        Map.of("lat", -23.55, "lng", -46.63, "familia", 2001),
                        Map.of("lat", -23.57, "lng", -46.65, "familia", 2002)
                )
        ));
    }

    @GetMapping("/condicoes")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR_SISTEMA','GESTOR_AB','ACS')")
    public ResponseEntity<Map<String, Object>> condicoes(@RequestParam String condicao) {
        return ResponseEntity.ok(Map.of(
                "condicao", condicao,
                "pontos", List.of(
                        Map.of("lat", -23.551, "lng", -46.632, "pacienteId", 3001),
                        Map.of("lat", -23.559, "lng", -46.638, "pacienteId", 3002)
                )
        ));
    }

    @GetMapping("/dispositivos")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR_SISTEMA','GESTOR_AB','ACS')")
    public ResponseEntity<Map<String, Object>> dispositivos() {
        return ResponseEntity.ok(Map.of(
                "dispositivos", List.of(
                        Map.of(
                                "id", 1,
                                "operadorId", 10,
                                "app", "ACS Mobile",
                                "versao", "1.0.0",
                                "ultimaImportacao", "2025-08-10T10:00:00"
                        ),
                        Map.of(
                                "id", 2,
                                "operadorId", 11,
                                "app", "ACS Mobile",
                                "versao", "1.0.1",
                                "ultimaExportacao", "2025-08-11T15:30:00"
                        )
                )
        ));
    }
}
