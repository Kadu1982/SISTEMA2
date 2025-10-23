
package com.sistemadesaude.backend.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;

/**
 * Operador master agora é criado via Flyway migration V3__Insert_Operador_Master.sql
 * Login: admin.master
 * Senha: Admin@123
 */
@Slf4j
@Configuration
public class OperadorMasterInitializer {

    public OperadorMasterInitializer() {
        log.info(">>> Operador master será criado via Flyway migration");
        log.info(">>> Login: admin.master");
        log.info(">>> Senha: Admin@123");
    }
}
