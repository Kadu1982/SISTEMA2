package com.sistemadesaude.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuração do Spring MVC para registrar interceptors.
 */
@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final RateLimitInterceptor rateLimitInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(rateLimitInterceptor)
                .addPathPatterns("/api/**") // Aplicar rate limit em todas as APIs
                .excludePathPatterns(
                        "/api/auth/login", // Excluir login (tem rate limit próprio)
                        "/api-docs/**",     // Excluir documentação
                        "/swagger-ui/**",   // Excluir Swagger UI
                        "/actuator/**"      // Excluir endpoints de monitoramento
                );
    }
}
