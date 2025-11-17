# ============================================
# STAGE 1: Build da aplicação
# ============================================
FROM maven:3.9.5-eclipse-temurin-21 AS build
WORKDIR /app

# Copiar arquivos de dependências primeiro (cache layer)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copiar código fonte e compilar
COPY src ./src
RUN mvn clean package -DskipTests -B

# ============================================
# STAGE 2: Runtime da aplicação
# ============================================
FROM eclipse-temurin:21-jre-alpine

# Instalar wget para healthcheck
RUN apk add --no-cache wget

# Criar usuário não-root para segurança
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

WORKDIR /app

# Copiar JAR compilado
COPY --from=build /app/target/*.jar app.jar

# Variáveis de ambiente padrão
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"

EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
