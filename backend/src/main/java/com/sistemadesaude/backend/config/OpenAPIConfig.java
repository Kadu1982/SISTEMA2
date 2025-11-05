package com.sistemadesaude.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Configuração do OpenAPI/Swagger para documentação automática das APIs.
 * Acesse em: http://localhost:8080/swagger-ui.html
 */
@Configuration
public class OpenAPIConfig {

    @Value("${app.brand.org-nome:Sistema de Saúde}")
    private String organizacao;

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Cidade Saúde Digital - API")
                        .version("1.0.0")
                        .description("""
                                API REST do Sistema Unificado de Gestão em Saúde Pública.

                                **Módulos disponíveis:**
                                - Laboratório (Recepção, Coleta, Resultados)
                                - SAMU (Regulação, Ocorrências, Viaturas)
                                - Saúde da Família (ESF, ACS, Visitas)
                                - Agendamentos e Recepção
                                - Atendimento e Prontuário Eletrônico
                                - Farmácia e Dispensação
                                - Estoque e Faturamento
                                - Odontológico, Triagem, UPA

                                **Autenticação:**
                                Todas as rotas (exceto /api/auth/login) requerem token JWT no header Authorization: Bearer {token}
                                """)
                        .contact(new Contact()
                                .name(organizacao)
                                .email("contato@saude.gov.br"))
                        .license(new License()
                                .name("Uso Público")
                                .url("https://github.com/exemplo/sistema-saude")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Servidor Local"),
                        new Server().url("http://localhost:9090").description("Gateway (Load Balancer)")
                ))
                .components(new Components()
                        .addSecuritySchemes("bearer-jwt", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Token JWT obtido no endpoint /api/auth/login")))
                .addSecurityItem(new SecurityRequirement().addList("bearer-jwt"));
    }
}
