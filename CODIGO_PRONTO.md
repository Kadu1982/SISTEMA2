# 💻 Código Pronto para Produção

## ⚡ Copy & Paste - Pronto para Usar

---

## 1️⃣ GlobalExceptionHandler.java

**Caminho:** `backend/src/main/java/com/sistemadesaude/backend/exception/GlobalExceptionHandler.java`

```java
package com.sistemadesaude.backend.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.persistence.EntityNotFoundException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Handler global de exceções para toda a aplicação
 * Garante respostas padronizadas e logging centralizado
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Trata AccessDeniedException - Acesso negado (403)
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleAccessDeniedException(
            AccessDeniedException ex) {
        
        log.warn("⚠️ AccessDeniedException: {}", ex.getMessage());
        
        Map<String, Object> details = new HashMap<>();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth != null) {
            List<String> userRoles = auth.getAuthorities().stream()
                .map(authority -> authority.getAuthority().replace("ROLE_", ""))
                .sorted()
                .collect(Collectors.toList());
            
            details.put("userRoles", userRoles);
            log.debug("Usuário com roles: {}", userRoles);
        } else {
            log.debug("Usuário não autenticado");
        }
        
        ApiResponse<Map<String, Object>> response = new ApiResponse<>(
            false,
            "Acesso negado. Verifique suas permissões.",
            details
        );
        
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    /**
     * Trata BadCredentialsException - Credenciais inválidas (401)
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<?>> handleBadCredentialsException(
            BadCredentialsException ex) {
        
        log.warn("⚠️ Credenciais inválidas");
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(new ApiResponse<>(
                false,
                "Email ou senha inválidos",
                null
            ));
    }

    /**
     * Trata MethodArgumentNotValidException - Validação falhou (400)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidationException(
            MethodArgumentNotValidException ex) {
        
        log.warn("⚠️ Erro de validação");
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> {
            String fieldName = error.getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
            log.debug("Campo '{}' com erro: {}", fieldName, errorMessage);
        });
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ApiResponse<>(false, "Validação falhou", errors));
    }

    /**
     * Trata EntityNotFoundException - Recurso não encontrado (404)
     */
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleEntityNotFoundException(
            EntityNotFoundException ex) {
        
        log.warn("⚠️ Recurso não encontrado: {}", ex.getMessage());
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ApiResponse<>(false, ex.getMessage(), null));
    }

    /**
     * Trata Exception genérica - Erro interno (500)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleGenericException(Exception ex) {
        
        log.error("❌ Erro não tratado", ex);
        
        String message = "Erro interno do servidor";
        if (ex.getMessage() != null && !ex.getMessage().isEmpty()) {
            message += ": " + ex.getMessage();
        }
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ApiResponse<>(false, message, null));
    }
}
```

---

## 2️⃣ ApiResponse.java

**Caminho:** `backend/src/main/java/com/sistemadesaude/backend/exception/ApiResponse.java`

```java
package com.sistemadesaude.backend.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Resposta padrão para todas as APIs
 * Garante consistência nas respostas
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ApiResponse<T> {
    
    /**
     * Indica se a operação foi bem-sucedida
     */
    private boolean success;
    
    /**
     * Mensagem descritiva sobre o resultado
     */
    private String message;
    
    /**
     * Dados da resposta (pode ser null em caso de erro)
     */
    private T data;
    
    /**
     * Factory method para sucesso
     */
    public static <T> ApiResponse<T> success(String message) {
        return new ApiResponse<>(true, message, null);
    }
    
    /**
     * Factory method para sucesso com dados
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }
    
    /**
     * Factory method para erro
     */
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }
    
    /**
     * Factory method para erro com detalhes
     */
    public static <T> ApiResponse<T> error(String message, T data) {
        return new ApiResponse<>(false, message, data);
    }
}
```

---

## 3️⃣ CustomAuthenticationEntryPoint.java

**Caminho:** `backend/src/main/java/com/sistemadesaude/backend/config/CustomAuthenticationEntryPoint.java`

```java
package com.sistemadesaude.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sistemadesaude.backend.exception.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Ponto de entrada para autenticação - substitui o diálogo HTTP Basic
 */
@Component
@Slf4j
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public void commence(HttpServletRequest request, 
                        HttpServletResponse response,
                        AuthenticationException authException) throws IOException, ServletException {
        
        log.warn("❌ Falha na autenticação: {}", authException.getMessage());
        
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        
        ApiResponse<?> errorResponse = ApiResponse.error(
            "Autenticação necessária. Token inválido ou expirado."
        );
        
        String jsonResponse = objectMapper.writeValueAsString(errorResponse);
        response.getWriter().write(jsonResponse);
    }
}
```

---

## 4️⃣ CustomAccessDeniedHandler.java

**Caminho:** `backend/src/main/java/com/sistemadesaude/backend/config/CustomAccessDeniedHandler.java`

```java
package com.sistemadesaude.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sistemadesaude.backend.exception.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Handler de acesso negado - fornece feedback de permissões ao usuário
 */
@Component
@Slf4j
public class CustomAccessDeniedHandler implements AccessDeniedHandler {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public void handle(HttpServletRequest request, 
                      HttpServletResponse response,
                      AccessDeniedException accessDeniedException) throws IOException, ServletException {
        
        log.warn("🔐 Acesso negado: {}", accessDeniedException.getMessage());
        
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json;charset=UTF-8");
        
        // Coleta informações do usuário atual
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> details = new HashMap<>();
        
        if (auth != null) {
            List<String> userRoles = auth.getAuthorities().stream()
                .map(authority -> authority.getAuthority().replace("ROLE_", ""))
                .sorted()
                .collect(Collectors.toList());
            
            details.put("userRoles", userRoles);
            log.debug("Usuário {} com roles: {}", auth.getName(), userRoles);
        }
        
        ApiResponse<?> errorResponse = ApiResponse.error(
            "Acesso negado. Você não tem permissão para realizar esta ação.",
            details
        );
        
        String jsonResponse = objectMapper.writeValueAsString(errorResponse);
        response.getWriter().write(jsonResponse);
    }
}
```

---

## 5️⃣ SecurityConfig.java (Seção exceptionHandling)

**Substituir a seção `exceptionHandling` em:** `backend/src/main/java/com/sistemadesaude/backend/config/SecurityConfig.java`

```java
// ANTES (❌ REMOVER):
// .exceptionHandling((exceptions) -> exceptions.authenticationEntryPoint(...))

// DEPOIS (✅ USAR):
.exceptionHandling(exceptions -> exceptions
    .authenticationEntryPoint(authenticationEntryPoint)
    .accessDeniedHandler(accessDeniedHandler)
)
```

**Injetar os handlers:**

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    
    @Autowired
    private CustomAuthenticationEntryPoint authenticationEntryPoint;
    
    @Autowired
    private CustomAccessDeniedHandler accessDeniedHandler;
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()))
            
            // ✅ USAR AQUI:
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(authenticationEntryPoint)
                .accessDeniedHandler(accessDeniedHandler)
            )
            
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.GET, "/api/unidades").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/health").permitAll()
                .anyRequest().authenticated()
            )
            
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
            );
        
        return http.build();
    }
}
```

---

## 6️⃣ AtualizarStatusAgendamentoRequest.java

**Caminho:** `backend/src/main/java/com/sistemadesaude/backend/recepcao/dto/AtualizarStatusAgendamentoRequest.java`

```java
package com.sistemadesaude.backend.recepcao.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para atualização de status de agendamento
 * Valida que o status é informado
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AtualizarStatusAgendamentoRequest {
    
    @NotBlank(message = "Status é obrigatório")
    private String status;
}
```

---

## 7️⃣ Frontend: errorHandler.ts

**Caminho:** `frontend/src/services/errorHandler.ts`

```typescript
import { toast } from "@/components/ui/use-toast";

export interface ApiErrorData {
  success?: boolean;
  message?: string;
  data?: {
    userRoles?: string[];
    [key: string]: any;
  };
  error?: string;
  valoresValidos?: string[];
  statusRecebido?: string;
}

export interface ParsedError {
  status: number;
  message: string;
  userRoles?: string[];
  validValues?: string[];
  receivedValue?: string;
  details?: any;
}

/**
 * Parse de erro da API para formato consumível
 */
export const parseApiError = (error: any): ParsedError => {
  const status = error?.response?.status || 500;
  const data = error?.response?.data as ApiErrorData;
  
  return {
    status,
    message: data?.message || data?.error || error?.message || "Erro desconhecido",
    userRoles: data?.data?.userRoles,
    validValues: data?.valoresValidos,
    receivedValue: data?.statusRecebido,
    details: data?.data,
  };
};

/**
 * Exibe toast de erro com feedback apropriado
 */
export const showErrorToast = (error: ParsedError, duration?: number) => {
  // 🔐 Erro de acesso negado - mostrar permissões
  if (error.status === 403) {
    const roles = error.userRoles?.length 
      ? error.userRoles.join(", ")
      : "Nenhuma";
    
    const description = 
      `${error.message}\n\n` +
      `🔐 Suas permissões atuais: ${roles}\n` +
      `Entre em contato com o administrador para obter as permissões necessárias.`;
    
    toast({
      title: "Acesso Negado",
      description,
      variant: "destructive",
      duration: duration || 10000,
    });
    return;
  }
  
  // ❌ Erro de validação - mostrar valores válidos
  if (error.status === 400) {
    let description = error.message;
    
    if (error.validValues?.length) {
      description += `\n\nValores válidos:\n${error.validValues.join(", ")}`;
    }
    
    if (error.receivedValue) {
      description += `\n\nValor recebido: ${error.receivedValue}`;
    }
    
    toast({
      title: "Erro de Validação",
      description,
      variant: "destructive",
      duration: duration || 5000,
    });
    return;
  }
  
  // 🔓 Erro de autenticação
  if (error.status === 401) {
    toast({
      title: "Autenticação Necessária",
      description: error.message + "\n\nFaça login novamente.",
      variant: "destructive",
      duration: duration || 5000,
    });
    return;
  }
  
  // 🔍 Erro genérico
  toast({
    title: "Erro",
    description: error.message,
    variant: "destructive",
    duration: duration || 3000,
  });
};

/**
 * Wrapper para chamadas API com tratamento de erro
 */
export const handleApiRequest = async <T>(
  fn: () => Promise<T>,
  options?: {
    successMessage?: string;
    errorDuration?: number;
    showSuccess?: boolean;
  }
): Promise<{ success: boolean; data?: T; error?: ParsedError }> => {
  try {
    const data = await fn();
    
    if (options?.showSuccess !== false && options?.successMessage) {
      toast({
        title: "Sucesso!",
        description: options.successMessage,
        className: "bg-green-100 text-green-800",
      });
    }
    
    return { success: true, data };
  } catch (error: any) {
    const parsedError = parseApiError(error);
    showErrorToast(parsedError, options?.errorDuration);
    return { success: false, error: parsedError };
  }
};
```

---

## 8️⃣ Frontend: Uso em Componente

**Exemplo em:** `frontend/src/pages/AtendimentoMedico.tsx`

```typescript
import { parseApiError, showErrorToast } from "@/services/errorHandler";

// ... dentro do componente ...

const atualizarStatusAgendamento = async (agendamentoId: number, status: string) => {
  try {
    const normalized = String(status || "").toUpperCase();
    
    await apiService.patch(`/agendamentos/${agendamentoId}/status`, { 
      status: normalized 
    });
    
    toast({
      title: "Sucesso!",
      description: `Agendamento alterado para ${normalized}`,
      className: "bg-green-100 text-green-800",
    });
    
    // Recarregar dados
    await carregarDados();
    
  } catch (error: any) {
    const parsedError = parseApiError(error);
    showErrorToast(parsedError);
    console.error("Erro detalhado:", parsedError);
    throw error;
  }
};
```

---

## ✅ Checklist de Implementação

### Backend
- [ ] Criar `GlobalExceptionHandler.java`
- [ ] Criar `ApiResponse.java`
- [ ] Criar `CustomAuthenticationEntryPoint.java`
- [ ] Criar `CustomAccessDeniedHandler.java`
- [ ] Atualizar `SecurityConfig.java` - seção exceptionHandling
- [ ] Criar/atualizar `AtualizarStatusAgendamentoRequest.java`
- [ ] Adicionar imports necessários
- [ ] Compilar: `mvn clean compile`
- [ ] Testar: `mvn spring-boot:run`

### Frontend
- [ ] Criar `services/errorHandler.ts`
- [ ] Atualizar componentes críticos (AtendimentoMedico, Login, etc)
- [ ] Testar com backend

### Testes
- [ ] Teste 403 com feedback de permissões
- [ ] Teste 400 com valores válidos
- [ ] Teste 500 com detalhes de erro
- [ ] Teste login/logout
- [ ] Teste atualização de status

---

## 🧪 Comando para Testar

```bash
# Terminal 1 - Backend
cd backend
mvn clean compile
mvn spring-boot:run

# Terminal 2 - Frontend (novo terminal)
cd frontend
npm run dev

# Terminal 3 - Testar API (curl)
curl -X GET http://localhost:8080/api/unidades

curl -X PATCH http://localhost:8080/api/agendamentos/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"status":"INVALIDO"}'
```

---

## 📊 Resultado Esperado

### Sucesso
```json
{
  "success": true,
  "message": "Operação realizada com sucesso",
  "data": { ... }
}
```

### Erro 403
```json
{
  "success": false,
  "message": "Acesso negado",
  "data": {
    "userRoles": ["RECEPCAO"]
  }
}
```

### Erro 400
```json
{
  "success": false,
  "message": "Status inválido",
  "data": {
    "error": "Status inválido",
    "statusRecebido": "INVALIDO",
    "valoresValidos": [
      "EM_ATENDIMENTO",
      "CONCLUIDO",
      "CANCELADO"
    ]
  }
}
```

### Erro 500
```json
{
  "success": false,
  "message": "Erro interno: NullPointerException. Causa: ...",
  "data": null
}
```

---

## 🎉 Pronto!

Todos os arquivos estão prontos para copy & paste. Basta seguir o checklist acima.

**Tempo estimado de implementação:** 30-45 minutos

**Benefício:** Sistema robusto, seguro e com excelente UX em caso de erros.

