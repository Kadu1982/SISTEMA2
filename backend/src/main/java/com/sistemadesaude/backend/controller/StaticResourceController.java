package com.sistemadesaude.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@RestController
public class StaticResourceController {

    @GetMapping(value = "/favicon.ico", produces = "image/svg+xml")
    public ResponseEntity<String> favicon() {
        // Retorna um favicon SVG inline para evitar 404
        String svgFavicon = """
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="32" height="32">
                <rect width="64" height="64" rx="12" fill="#1c64f2"/>
                <path d="M18 34h10l4-12 4 20 4-12h6" stroke="white" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            """;
        
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("image/svg+xml"))
                .body(svgFavicon);
    }

    @GetMapping("/")
    public ResponseEntity<String> root() {
        return ResponseEntity.ok("Sistema de Saúde - API Backend está funcionando!");
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }
}
