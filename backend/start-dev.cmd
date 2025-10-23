@echo off
set SPRING_PROFILES_ACTIVE=dev
set SPRING_DATASOURCE_PASSWORD=123456
set SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/saude_db
set SPRING_DATASOURCE_USERNAME=postgres

mvnw.cmd spring-boot:run
