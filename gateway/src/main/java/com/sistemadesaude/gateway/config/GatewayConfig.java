package com.sistemadesaude.gateway.config;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Mono;

import java.util.Objects;

@Configuration
public class GatewayConfig {

    @Bean
    public KeyResolver userKeyResolver() {
        return exchange -> {
            // Rate limiting por IP
            String clientIp = exchange.getRequest().getRemoteAddress() != null ?
                    Objects.requireNonNull(exchange.getRequest().getRemoteAddress()).getAddress().getHostAddress() :
                    "unknown";

            // Se houver header de autorização, use o usuário
            String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                // Aqui você poderia decodificar o JWT para pegar o usuário
                // Por simplicidade, vamos usar o IP + hash do token
                return Mono.just(clientIp + "-" + Math.abs(authHeader.hashCode() % 1000));
            }

            return Mono.just(clientIp);
        };
    }
}