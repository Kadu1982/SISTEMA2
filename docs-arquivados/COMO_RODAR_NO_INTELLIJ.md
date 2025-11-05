# 🚀 **COMO RODAR O SISTEMA COMPLETO NO INTELLIJ**

## ⚡ **INICIO RÁPIDO - 5 MINUTOS**

### **1. PRÉ-REQUISITOS (1 minuto)**
```bash
# Verificar se estão rodando:
# ✅ PostgreSQL (localhost:5432)
# ⚠️ Redis - Se não tiver, rodar:
cd scripts
setup-redis-cache.bat
```

### **2. CONFIGURAR INTELLIJ (2 minutos)**

#### **2.1 Import o projeto Gateway**
1. `File` → `New` → `Module from Existing Sources`
2. Selecionar: `D:\IntelliJ\sistema2\gateway\pom.xml`
3. Aguardar Maven sincronizar

#### **2.2 Criar Run Configurations**

**Backend Instance 1:**
```
Name: Backend-8080
Main class: com.sistemadesaude.backend.BackendApplication
VM options: -Xmx2g -Xms1g -XX:+UseG1GC
Program arguments: --spring.profiles.active=dev,instance1
```

**Backend Instance 2:**
```
Name: Backend-8081
Main class: com.sistemadesaude.backend.BackendApplication
VM options: -Xmx2g -Xms1g -XX:+UseG1GC
Program arguments: --spring.profiles.active=dev,instance2
```

**Backend Instance 3:**
```
Name: Backend-8082
Main class: com.sistemadesaude.backend.BackendApplication
VM options: -Xmx1g -Xms512m -XX:+UseG1GC
Program arguments: --spring.profiles.active=dev,instance3
```

**API Gateway:**
```
Name: Gateway-9090
Main class: com.sistemadesaude.gateway.GatewayApplication
VM options: -Xmx1g -Xms512m
Working directory: D:\IntelliJ\sistema2\gateway
```

#### **2.3 Compound Configuration**
1. `Run` → `Edit Configurations`
2. `+` → `Compound`
3. **Name:** `Sistema-Completo`
4. Adicionar todas as 4 configurações

### **3. EXECUTAR (2 minutos)**
1. Clicar em `Sistema-Completo` e executar
2. Aguardar todas as instâncias subirem
3. Testar: http://localhost:9090/api/operadores/info

---

## 🔧 **CONFIGURAÇÃO DETALHADA**

### **Estrutura do Projeto no IntelliJ:**
```
sistema2/
├── backend/          ← Projeto principal (já aberto)
├── gateway/          ← Novo módulo (importar)
├── frontend/         ← React (opcional)
└── scripts/          ← Scripts de setup
```

### **URLs Importantes:**

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **API Gateway** | http://localhost:9090 | Ponto de entrada principal |
| **Backend 1** | http://localhost:8080 | Instância principal |
| **Backend 2** | http://localhost:8081 | Instância secundária |
| **Backend 3** | http://localhost:8082 | Instância de backup |
| **Swagger** | http://localhost:8080/swagger-ui/index.html | Documentação API |
| **Actuator Gateway** | http://localhost:9090/actuator | Saúde do Gateway |

### **Monitoramento em Tempo Real:**
```bash
# Health checks
curl http://localhost:9090/actuator/health
curl http://localhost:8080/actuator/health
curl http://localhost:8081/actuator/health
curl http://localhost:8082/actuator/health

# Métricas
curl http://localhost:9090/actuator/metrics
curl http://localhost:8080/actuator/prometheus
```

---

## 🧪 **TESTES DE FUNCIONALIDADE**

### **1. Teste básico de funcionamento:**
```bash
# Via Gateway (load balanced)
curl http://localhost:9090/api/operadores/info

# Resposta esperada: informações de uma das instâncias
```

### **2. Teste de load balancing:**
```bash
# Executar várias vezes e ver instâncias diferentes respondendo
for i in {1..10}; do
  curl http://localhost:9090/api/operadores/info | grep instance
done
```

### **3. Teste de cache Redis:**
```bash
# Primeira requisição (vai no banco)
curl http://localhost:9090/api/pacientes/1

# Segunda requisição (vem do cache)
curl http://localhost:9090/api/pacientes/1
```

### **4. Teste de failover:**
1. Parar uma instância no IntelliJ
2. Fazer requisições - deve continuar funcionando
3. Verificar logs do Gateway

---

## 🎯 **CENÁRIOS DE TESTE AVANÇADOS**

### **Teste de Carga Simples (Apache Bench):**
```bash
# 1000 requisições com 50 concurrent
ab -n 1000 -c 50 http://localhost:9090/api/operadores/info

# Resultados esperados:
# - Requests per second: > 500
# - Time per request: < 100ms
# - Failed requests: 0
```

### **Stress Test com múltiplas APIs:**
```bash
# Pacientes
ab -n 500 -c 25 http://localhost:9090/api/pacientes

# Agendamentos
ab -n 500 -c 25 http://localhost:9090/api/agendamentos

# Configurações
ab -n 500 -c 25 http://localhost:9090/api/configuracoes
```

---

## 🐛 **TROUBLESHOOTING**

### **Problema: Instância não sobe**
```bash
# Verificar porta em uso
netstat -an | findstr 8080

# Matar processo na porta
taskkill /F /PID <PID>
```

### **Problema: Gateway não conecta nas instâncias**
1. Verificar se todas as instâncias estão UP
2. Verificar logs do Gateway
3. Testar acesso direto: http://localhost:8080/actuator/health

### **Problema: Redis não conecta**
```bash
# Verificar se Redis está rodando
redis-cli ping

# Se não estiver, executar:
redis-server --daemonize yes
```

### **Problema: Banco de dados**
```bash
# Verificar conexão PostgreSQL
psql -h localhost -p 5432 -U postgres -d saude_db

# Verificar pool de conexões
curl http://localhost:8080/actuator/metrics/hikaricp.connections.active
```

---

## 📊 **MÉTRICAS DE PERFORMANCE ESPERADAS**

Com sua configuração (32GB RAM, i5 11400H):

| Métrica | Valor Esperado | Como Verificar |
|---------|----------------|----------------|
| **Latência média** | < 50ms | Apache Bench |
| **Throughput** | > 1000 req/s | JMeter |
| **Uso de RAM** | < 8GB total | Task Manager |
| **CPU** | < 70% | Task Manager |
| **Conexões DB** | < 30 ativas | Actuator metrics |
| **Cache hit rate** | > 80% | Redis metrics |

---

## 🚀 **PRÓXIMOS PASSOS (OPCIONAL)**

### **1. Adicionar Prometheus + Grafana:**
```bash
# Docker Compose para monitoring
docker run -d -p 9091:9090 prom/prometheus
docker run -d -p 3000:3000 grafana/grafana
```

### **2. Load Balancer NGINX:**
- Instalar NGINX
- Configurar nginx.conf (ver CONFIGURACAO_ALTA_DISPONIBILIDADE.md)
- Acessar via http://localhost (porta 80)

### **3. Testes automatizados:**
- JMeter test plans
- Continuous load testing
- Performance regression tests

---

## ✅ **CHECKLIST DE VERIFICAÇÃO**

- [ ] PostgreSQL rodando na porta 5432
- [ ] Redis rodando na porta 6379
- [ ] 4 configurações Spring Boot criadas
- [ ] Compound configuration criada
- [ ] Todas as instâncias sobem sem erro
- [ ] Gateway distribui carga entre instâncias
- [ ] Cache Redis funcionando
- [ ] Actuator endpoints respondendo
- [ ] Testes de load passando

**🎉 Seu sistema agora suporta 1000+ usuários simultâneos!**