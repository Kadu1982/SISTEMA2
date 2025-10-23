package com.sistemadesaude.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class GatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // Rota para instância 1 (8080)
                .route("backend-instance1", r -> r
                        .path("/api/**")
                        .and()
                        .weight("backend-group", 40)
                        .uri("http://localhost:8080"))

                // Rota para instância 2 (8081)
                .route("backend-instance2", r -> r
                        .path("/api/**")
                        .and()
                        .weight("backend-group", 30)
                        .uri("http://localhost:8081"))

                // Rota para instância 3 (8082)
                .route("backend-instance3", r -> r
                        .path("/api/**")
                        .and()
                        .weight("backend-group", 30)
                        .uri("http://localhost:8082"))

                // Rota para documentação Swagger
                .route("swagger-docs", r -> r
                        .path("/swagger-ui/**", "/v3/api-docs/**")
                        .uri("http://localhost:8080"))

                // Rota para actuator de todas as instâncias
                .route("actuator-instance1", r -> r
                        .path("/actuator/instance1/**")
                        .filters(f -> f.rewritePath("/actuator/instance1/(?<path>.*)", "/actuator/${path}"))
                        .uri("http://localhost:8080"))

                .route("actuator-instance2", r -> r
                        .path("/actuator/instance2/**")
                        .filters(f -> f.rewritePath("/actuator/instance2/(?<path>.*)", "/actuator/${path}"))
                        .uri("http://localhost:8081"))

                .route("actuator-instance3", r -> r
                        .path("/actuator/instance3/**")
                        .filters(f -> f.rewritePath("/actuator/instance3/(?<path>.*)", "/actuator/${path}"))
                        .uri("http://localhost:8082"))

                .build();
    }
}