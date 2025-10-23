package com.sistemadesaude.gateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> getFallback() {
        return createFallbackResponse();
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> postFallback() {
        return createFallbackResponse();
    }

    private ResponseEntity<Map<String, Object>> createFallbackResponse() {
        Map<String, Object> response = Map.of(
                "status", "SERVICE_UNAVAILABLE",
                "message", "Sistema de Saúde temporariamente indisponível. Tente novamente em alguns instantes.",
                "timestamp", LocalDateTime.now(),
                "service", "saude-gateway",
                "details", "Todas as instâncias do backend estão indisponíveis. O sistema está sendo recuperado automaticamente."
        );

        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }
}