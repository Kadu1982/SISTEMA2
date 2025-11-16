package com.sistemadesaude.backend.config;

import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class FlywayConfig {

    /**
     * Strategy customizada que permite aplicar migrations pendentes
     * TEMPORÁRIO: Para sincronizar migrations antigas que não foram aplicadas
     * As configurações validate-on-migrate=false e out-of-order=true 
     * devem estar no application-dev.properties
     */
    @Bean
    @Primary
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            // Repara migrations com falha antes de executar
            flyway.repair();
            
            // Executa migrations
            // Com validate-on-migrate=false e out-of-order=true no properties,
            // o Flyway deve aplicar todas as migrations pendentes sem validar ordem
            flyway.migrate();
        };
    }
}
