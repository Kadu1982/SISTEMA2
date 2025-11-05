# SISTEMA2 - Technical Debt Breakdown

## 1. Database Layer Technical Debt

### Issue: Duplicate Migration Files

**Files Affected:**
- `/backend/src/main/resources/db/migration/V202510101211__create_beneficios_tables.sql` (4.7 KB)
- `/backend/src/main/resources/db/migration/V202510111500__create_beneficios_tables.sql` (4.7 KB)

**Root Cause:** Accidental duplication during migration creation

**Impact:** 
- Flyway will fail on startup with version conflict
- Database initialization will be blocked
- Deployment will fail

**Fix:**
```bash
# Delete the duplicate file
rm /backend/src/main/resources/db/migration/V202510111500__create_beneficios_tables.sql

# Verify only one remains
ls -la /backend/src/main/resources/db/migration/*beneficio* 
```

**Prevention:**
- Use Flyway version validation in CI/CD
- Implement migration naming conventions in git hooks
- Code review process for all migration files

---

### Issue: Inconsistent Migration Naming Convention

**Current State:**
```
V1__Initial_Schema.sql
V2__areas_e_micros.sql
V3__Insert_Operador_Master.sql
...
V202508180901__acs_areas_e_micros.sql
V20250820_1500__Align_security_tables.sql
V202509251200__add_cor_prioridade_to_classificacao_risco.sql
V202501250001__criar_tabela_triagens.sql
V20250125_0001__criar_tabela_triagens.sql  (BOM character present)
```

**Problems:**
1. Mixed version numbering schemes (V1-V32 vs timestamp-based)
2. Inconsistent timestamp formats (YYYYMMDD vs YYYYMM_HHMM)
3. Single vs double underscores
4. Some files have BOM (Byte Order Mark) characters

**Recommended Standard:**
```
VYYYYMMDDHHmm__description_in_snake_case.sql
Examples:
V202511051430__create_beneficios_tables.sql
V202511051431__create_triagens_table.sql
V202511051432__fix_foreign_key_constraints.sql
```

**Action Items:**
1. Create migration rename script
2. Update all 75 migration files
3. Document standard in CONTRIBUTING.md
4. Update CI/CD validation

---

### Issue: Non-Idempotent Migrations

**Pattern:** Mix of idempotent and non-idempotent SQL

**Idempotent (Good):**
```sql
CREATE TABLE IF NOT EXISTS types_beneficio (...)
CREATE INDEX IF NOT EXISTS idx_something ON table(column)
```

**Non-Idempotent (Bad):**
```sql
CREATE TABLE beneficios (...)  -- Will fail if table exists
ALTER TABLE existing_table ADD COLUMN new_col VARCHAR(255)  -- Will fail if column exists
```

**Fix Approach:**
```sql
-- Good pattern
CREATE TABLE IF NOT EXISTS beneficios (
    id BIGSERIAL PRIMARY KEY,
    ...
);

ALTER TABLE IF EXISTS existing_table 
ADD COLUMN IF NOT EXISTS new_column VARCHAR(255);

-- For constraints
DO $$
BEGIN
  ALTER TABLE beneficios 
  ADD CONSTRAINT fk_something FOREIGN KEY(...) 
  REFERENCES other_table(...);
EXCEPTION 
  WHEN duplicate_object THEN NULL;
END $$;
```

---

## 2. Security Technical Debt

### Issue: Hardcoded Secrets

**Locations:**
```
docker-compose.yml
  Line 9: POSTGRES_PASSWORD: 123456
  Line 32: SPRING_DATASOURCE_PASSWORD: 123456

/backend/src/main/resources/application.properties
  Line 7: spring.datasource.password=${SPRING_DATASOURCE_PASSWORD:123456}
  Line 78: jwt.secret=YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXoxMjM0NTY3ODkw

/backend/src/main/resources/application-dev.properties
  Line 42: jwt.secret=SUA_CHAVE_SECRETA_SUPER_LONGA_E_SEGURA_AQUI
```

**Risks:**
- Credentials in version control (exposed in git history)
- Default credentials easily guessable
- Breach via source code leak
- Compliance violations (PCI-DSS, HIPAA)

**Solution:**

1. **For Local Development:**
```properties
# application-dev.properties (NO SECRETS)
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
jwt.secret=${JWT_SECRET}

# .env file (NOT COMMITTED)
SPRING_DATASOURCE_PASSWORD=dev_password_123
JWT_SECRET=dev_jwt_secret_very_long_string
```

2. **For Docker:**
```yaml
# docker-compose.yml
services:
  postgres:
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      
  backend:
    environment:
      SPRING_DATASOURCE_PASSWORD: ${SPRING_DATASOURCE_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
```

3. **For Production (AWS):**
```java
// Use AWS Secrets Manager
@Configuration
public class SecretsConfig {
    @Bean
    public String dbPassword() {
        SecretsManagerClient client = SecretsManagerClient.builder().build();
        GetSecretValueRequest request = GetSecretValueRequest.builder()
            .secretId("saude-db-password")
            .build();
        GetSecretValueResponse response = client.getSecretValue(request);
        return response.secretString();
    }
}
```

4. **CI/CD Pipeline:**
```yaml
# GitHub Actions example
env:
  JWT_SECRET: ${{ secrets.JWT_SECRET }}
  DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
```

---

### Issue: Insecure Content Security Policy

**Current SecurityConfig.java:**
```java
.contentSecurityPolicy(csp -> csp
    .policyDirectives("default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        ...
    )
)
```

**Problems:**
- `'unsafe-inline'`: Defeats XSS protection
- `'unsafe-eval'`: Allows code injection
- No nonce mechanism
- No hash verification

**Fix:**
```java
@Configuration
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .headers(headers -> headers
                .contentSecurityPolicy(csp -> csp
                    .policyDirectives(
                        "default-src 'self'; " +
                        "script-src 'self' 'nonce-{NONCE}'; " +
                        "style-src 'self' 'nonce-{NONCE}'; " +
                        "img-src 'self' data: https:; " +
                        "font-src 'self' data:; " +
                        "connect-src 'self' https:; " +
                        "frame-ancestors 'none'; " +
                        "base-uri 'self'; " +
                        "form-action 'self'; " +
                        "upgrade-insecure-requests; " +
                        "block-all-mixed-content"
                    )
                )
            );
        return http.build();
    }
}
```

---

## 3. Code Quality Technical Debt

### Issue: Wildcard Imports

**Files:**
- upa/entity/Upa.java
- upa/entity/AtendimentoUpa.java
- upa/entity/TriagemUpa.java
- upa/dto/TriadoDTO.java
- (7 more similar files in same module)

**Impact:**
- Reduced code clarity
- Masks unused dependencies
- Can hide circular dependencies
- Makes refactoring harder

**Fix Script:**
```bash
# Expand all wildcard imports
mvn com.googlecode.maven-java-formatter-maven-plugin:maven-java-formatter-maven-plugin:format

# Or configure IntelliJ IDEA
# Settings > Editor > Code Style > Java > Imports
# Set "Class count to use import with *" to 999 (effectively disable)
```

---

### Issue: Debug Statements

**Files & Lines:**

```java
// ColetaService.java
System.out.println("=== DEBUG ColetaService.listarPacientesAguardandoColeta ===");
System.out.println("unidadeId: " + unidadeId);
System.out.println("Resultado: " + (result != null ? result.size() + " registros" : "NULL"));

// ColetaController.java
catch (Exception e) {
    e.printStackTrace();
}

// UnidadeSaudeController.java
catch (Exception e) {
    e.printStackTrace();
}
```

**Impact:**
- Performance degradation
- Security risk (stack traces expose internal structure)
- Unprofessional (should use proper logging)
- Logs unfiltered to console

**Fix - Use SLF4J:**
```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ColetaService {
    private static final Logger logger = LoggerFactory.getLogger(ColetaService.class);
    
    public List<Coleta> listarPacientesAguardandoColeta(Long unidadeId) {
        logger.debug("Buscando pacientes aguardando coleta. unidadeId={}", unidadeId);
        
        List<Coleta> result = coletaRepository.findByUnidadeAndStatus(unidadeId, "AGUARDANDO");
        
        logger.debug("Resultado da busca: {} registros encontrados", 
            result != null ? result.size() : 0);
        
        return result;
    }
}
```

---

### Issue: Poor TypeScript Type Safety

**Current tsconfig.json:**
```json
{
  "compilerOptions": {
    "strict": false,           // SHOULD BE TRUE
    "noImplicitAny": false,    // SHOULD BE TRUE
    "noUnusedLocals": false,   // SHOULD BE TRUE
    "noUnusedParameters": false // SHOULD BE TRUE
  }
}
```

**Usage Pattern - BAD:**
```typescript
// BAD: Using 'any' (419+ instances found)
const handleSubmit = (data: any) => {
  const response: any = await api.post('/endpoint', data);
  return response.data;
};

type AnyObj = Record<string, any>;
```

**Fixed Version:**
```typescript
// GOOD: Proper typing
interface FormData {
  name: string;
  email: string;
  age: number;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

const handleSubmit = (data: FormData): Promise<ApiResponse<User>> => {
  return api.post<ApiResponse<User>>('/endpoint', data);
};
```

**Migration Path:**
1. Update tsconfig.json to enable strict checks
2. Run TypeScript compiler to find all issues
3. Create types for all data structures
4. Gradually fix issues (may take 1-2 weeks)
5. Use `@ts-ignore` as temporary measure (track in TODO)

---

## 4. Testing Technical Debt

### Issue: No Unit Tests Found

**Current State:**
- 639 Java files: 0 visible test files
- 356 TypeScript files: 0 visible test files
- No test configuration in pom.xml beyond basic test framework
- No test examples or patterns documented

**Impact:**
- No protection against regressions
- Difficult to refactor with confidence
- Higher bug rate in production
- Longer debugging time

**Minimal Test Coverage Plan:**

```java
// Example: Unit Test for Service
@SpringBootTest
@AutoConfigureMockMvc
class ColetaServiceTest {
    
    @MockBean
    private ColetaRepository coletaRepository;
    
    @InjectMocks
    private ColetaService coletaService;
    
    @Test
    void testListarPacientesAguardandoColeta_Success() {
        // Arrange
        Long unidadeId = 1L;
        List<Coleta> expectedColetas = List.of(
            new Coleta(1L, "Paciente 1"),
            new Coleta(2L, "Paciente 2")
        );
        when(coletaRepository.findByUnidadeAndStatus(unidadeId, "AGUARDANDO"))
            .thenReturn(expectedColetas);
        
        // Act
        List<Coleta> result = coletaService.listarPacientesAguardandoColeta(unidadeId);
        
        // Assert
        assertEquals(2, result.size());
        verify(coletaRepository).findByUnidadeAndStatus(unidadeId, "AGUARDANDO");
    }
}
```

---

## 5. TODO Items Technical Debt

**Found TODOs:**

| File | Line | TODO | Severity |
|------|------|------|----------|
| AgendamentoExameServiceImpl.java | 1 | pegar do contexto de segurança | HIGH |
| AgendamentoExameServiceImpl.java | 2 | Enviar notificações (email, SMS) | MEDIUM |
| TermoUsoService.java | 1 | Implementar lógica de verificação | MEDIUM |
| RegistroOcorrenciaController.java | 1 | Implementar atualização | HIGH |
| SolicitacaoSamuController.java | 1 | Implementar atualização | HIGH |
| ListagemAgendamentosExames.tsx | 3 | pegar usuário do contexto | HIGH |

**Action Items:**
1. Create GitHub issues for each TODO
2. Set target resolution dates
3. Remove TODOs from code after fixing
4. Use SonarQube to track TODO density

---

## 6. Architecture Technical Debt

### Issue: Gateway Misconfiguration

**Current application.yml:**
```yaml
routes:
  - id: backend-route-1
    uri: http://localhost:8080
  - id: backend-route-2
    uri: http://localhost:8081  # Doesn't exist
  - id: backend-route-3
    uri: http://localhost:8082  # Doesn't exist
```

**Fix:**
```yaml
routes:
  - id: backend-route-1
    uri: http://localhost:8080
    predicates:
      - Path=/api/**
    filters:
      - CircuitBreaker=myCircuitBreaker
      - RequestRateLimiter=myRateLimiter
```

---

### Issue: Redis Configuration Uncertainty

**Locations:**
- /gateway (requires Redis for rate limiting)
- /backend (commented out by default)

**Fix - Add to docker-compose.yml:**
```yaml
redis:
  image: redis:7-alpine
  container_name: saude_redis
  ports:
    - "6379:6379"
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 10s
    timeout: 5s
    retries: 5
  volumes:
    - redis_data:/data

backend:
  depends_on:
    postgres:
      condition: service_healthy
    redis:
      condition: service_healthy

volumes:
  redis_data:
```

---

## 7. Estimated Effort for Remediation

| Category | Issues | Effort | Priority |
|----------|--------|--------|----------|
| Database Migrations | 3 | 4 hours | CRITICAL |
| Security/Secrets | 3 | 8 hours | CRITICAL |
| Code Quality | 4 | 2 days | HIGH |
| Testing | 1 | 2-4 weeks | HIGH |
| Architecture | 2 | 1 week | MEDIUM |
| **TOTAL** | **13** | **3-4 weeks** | - |

---

## 8. Tools & Automation

### SonarQube Analysis
```bash
mvn clean verify sonar:sonar \
  -Dsonar.projectKey=SISTEMA2 \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=your_token
```

### Pre-commit Hooks
```bash
# .git/hooks/pre-commit
#!/bin/bash

# Check for debug statements
if git diff --cached | grep -E "System\.out|\.printStackTrace"; then
  echo "Error: Debug statements found"
  exit 1
fi

# Check for secrets
if git diff --cached | grep -E "password.*=.*|secret.*=.*"; then
  echo "Error: Potential secrets in commit"
  exit 1
fi

exit 0
```

### CI/CD Integration
Add to GitHub Actions:
```yaml
- name: Check for secrets
  run: |
    mvn clean compile
    
- name: SonarQube Analysis
  run: mvn sonar:sonar

- name: TypeScript Build
  run: |
    cd frontend
    npm run build:strict
```

