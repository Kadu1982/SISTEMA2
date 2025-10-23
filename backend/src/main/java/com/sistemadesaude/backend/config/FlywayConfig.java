package com.sistemadesaude.backend.config;

import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FlywayConfig {

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            // Repara migrations com falha antes de executar
            flyway.repair();
            // Executa migrations antes do JPA inicializar
            flyway.migrate();
        };
    }
}
