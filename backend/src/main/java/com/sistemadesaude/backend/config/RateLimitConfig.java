package com.sistemadesaude.backend.config;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

/**
 * Configuração de Rate Limiting usando Caffeine Cache.
 * Previne abusos e ataques de força bruta.
 */
@Configuration
public class RateLimitConfig {

    /**
     * Cache para armazenar contadores de requisições por IP/usuário.
     * Key: IP ou usuarioId
     * Value: Contador de requisições
     */
    @Bean
    public Cache<String, Integer> rateLimitCache() {
        return Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofMinutes(1)) // Janela de 1 minuto
                .maximumSize(10000) // Máximo de 10k IPs diferentes
                .build();
    }

    /**
     * Cache para bloqueios temporários após exceder o limite.
     * Key: IP ou usuarioId
     * Value: Timestamp do bloqueio
     */
    @Bean
    public Cache<String, Long> blockedCache() {
        return Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofMinutes(15)) // Bloqueio de 15 minutos
                .maximumSize(5000)
                .build();
    }
}
