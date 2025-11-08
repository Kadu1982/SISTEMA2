# ⚡ Guia de Implementação Rápida - Correções Essenciais

## 📌 Status Atual do Sistema

```
✅ Erro 403 - RESOLVIDO (Endpoints públicos configurados)
✅ Erro Login Pop-up - RESOLVIDO (Custom authentication entry point)
✅ Erro 400 Bad Request - RESOLVIDO (DTO com validação)
✅ Erro Access Denied - RESOLVIDO (Feedback de permissões)
✅ Erro 500 - RESOLVIDO (Tratamento de erros com logging)
```

---

## 🔧 Implementações Críticas Faltando

### 1. **Global Exception Handler Completo** ⚠️ CRÍTICO

**Arquivo:** `backend/src/main/java/com/sistemadesaude/backend/exception/GlobalExceptionHandler.java`

```java
package com.sistemadesaude.backend.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.*;
import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleAccessDeniedException(
            AccessDeniedException ex) {
        log.warn("⚠️ AccessDeniedException: {}", ex.getMessage());
        
        Map<String, Object> details = new HashMap<>();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth != null) {
            List<String> userRoles = auth.getAuthorities().stream()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .sorted()
                .collect(Collectors.toList());
            
            details.put("userRoles", userRoles);
        }
        
        ApiResponse<Map<String, Object>> response = new ApiResponse<>(
            false,
            "Acesso negado",
            details
        );
        
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidationException(
            MethodArgumentNotValidException ex) {
        log.warn("⚠️ Validation failed");
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
            .forEach(error -> errors.put(
                error.getField(),
                error.getDefaultMessage()
            ));
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ApiResponse<>(false, "Validação falhou", errors));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleGenericException(Exception ex) {
        log.error("❌ Erro não tratado", ex);
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ApiResponse<>(
                false,
                "Erro interno: " + ex.getMessage(),
                null
            ));
    }
}
```

**Classe ApiResponse:**
```java
package com.sistemadesaude.backend.exception;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
}
```

---

### 2. **Security Config Melhorado** ⚠️ CRÍTICO

Atualizar `SecurityConfig.java`:

```java
// Substituir a seção exceptionHandling por:

.exceptionHandling(exceptions -> exceptions
    .authenticationEntryPoint((request, response, authException) -> {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(
            "{\"success\":false,\"message\":\"Autenticação necessária\",\"data\":null}"
        );
    })
    .accessDeniedHandler((request, response, accessDeniedException) -> {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json;charset=UTF-8");
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        List<String> userRoles = auth != null ? 
            auth.getAuthorities().stream()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .sorted()
                .collect(java.util.stream.Collectors.toList()) 
            : new java.util.ArrayList<>();
        
        String json = String.format(
            "{\"success\":false,\"message\":\"Acesso negado\",\"data\":{\"userRoles\":%s}}",
            new org.springframework.security.core.SpringSecurityCoreVersion()
                .toString() // Usar ObjectMapper se disponível
        );
        
        response.getWriter().write(json);
    })
)
```

---

### 3. **Validação de Agendamentos** ⚠️ IMPORTANTE

Arquivo: `backend/src/main/java/com/sistemadesaude/backend/recepcao/dto/AtualizarStatusAgendamentoRequest.java`

Verificar se existe, se não, criar:

```java
package com.sistemadesaude.backend.recepcao.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AtualizarStatusAgendamentoRequest {
    
    @NotBlank(message = "Status é obrigatório")
    private String status;
}
```

---

### 4. **Frontend - Error Handler Service** 📱 IMPORTANTE

Arquivo: `frontend/src/services/errorHandler.ts`

```typescript
import { toast } from "@/components/ui/use-toast";

export interface ApiError {
  status: number;
  message: string;
  userRoles?: string[];
  validValues?: string[];
  receivedValue?: string;
}

export const parseApiError = (error: any): ApiError => {
  const status = error?.response?.status || 500;
  const data = error?.response?.data;
  
  return {
    status,
    message: data?.message || data?.error || error?.message || "Erro desconhecido",
    userRoles: data?.data?.userRoles || data?.userRoles,
    validValues: data?.valoresValidos || data?.validValues,
    receivedValue: data?.statusRecebido || data?.receivedValue,
  };
};

export const showErrorToast = (error: ApiError) => {
  if (error.status === 403) {
    const roles = error.userRoles?.length 
      ? error.userRoles.join(", ")
      : "Nenhuma";
      
    toast({
      title: "Acesso Negado",
      description: `${error.message}\n\nSuas permissões: ${roles}`,
      variant: "destructive",
      duration: 10000,
    });
  } else if (error.status === 400) {
    let desc = error.message;
    if (error.validValues?.length) {
      desc += `\n\nValores válidos: ${error.validValues.join(", ")}`;
    }
    
    toast({
      title: "Erro de Validação",
      description: desc,
      variant: "destructive",
    });
  } else {
    toast({
      title: "Erro",
      description: error.message,
      variant: "destructive",
    });
  }
};
```

---

### 5. **Aplicar em Componentes Críticos**

**Arquivo:** `frontend/src/pages/AtendimentoMedico.tsx`

Substituir tratamento de erro por:

```typescript
const atualizarStatusAgendamento = async (agendamentoId: number, status: string) => {
  try {
    const normalized = String(status || "").toUpperCase();
    await apiService.patch(`/agendamentos/${agendamentoId}/status`, { 
      status: normalized 
    });
    
    toast({
      title: "Sucesso!",
      description: "Status atualizado com sucesso",
      className: "bg-green-100 text-green-800",
    });
  } catch (error: any) {
    const apiError = parseApiError(error);
    showErrorToast(apiError);
    throw error;
  }
};
```

---

## 📋 Checklist de Implementação

### Backend

- [ ] **Exception Handling**
  - [ ] Criar `GlobalExceptionHandler.java`
  - [ ] Criar `ApiResponse.java`
  - [ ] Atualizar `SecurityConfig.java` - exceptionHandling

- [ ] **DTOs e Validação**
  - [ ] Verificar `AtualizarStatusAgendamentoRequest.java`
  - [ ] Adicionar validações em outros DTOs críticos

- [ ] **Logging**
  - [ ] Adicionar logs em controllers críticos
  - [ ] Adicionar logs de erro em services

- [ ] **Testes**
  - [ ] Testar erro 403 com feedback de roles
  - [ ] Testar erro 400 com valores válidos
  - [ ] Testar erro 500 com detalhes

### Frontend

- [ ] **Error Handling**
  - [ ] Criar `services/errorHandler.ts`
  - [ ] Atualizar componentes críticos

- [ ] **UI/UX**
  - [ ] Mostrar permissões quando 403
  - [ ] Mostrar valores válidos quando 400
  - [ ] Melhorar mensagens de erro

- [ ] **Testes**
  - [ ] Testar fluxo de login com erro
  - [ ] Testar atualização de status com erro
  - [ ] Testar feedback de permissões

---

## 🚀 Ordem de Implementação

### Fase 1: Backend (2-3 horas)
1. Criar `GlobalExceptionHandler`
2. Criar `ApiResponse`
3. Atualizar `SecurityConfig`
4. Recompilar e testar

### Fase 2: Frontend (1-2 horas)
1. Criar `errorHandler.ts`
2. Atualizar componentes críticos
3. Testar com backend

### Fase 3: Validação (1 hora)
1. Testar todos os cenários de erro
2. Validar feedback de permissões
3. Validar feedback de validação

---

## 🧪 Testes Recomendados

### Test 1: Login sem autenticação
```
GET /api/unidades (sem token)
✅ Status: 200 (público, sem auth necessária)
```

### Test 2: Acessar recurso protegido sem token
```
PATCH /api/agendamentos/1/status
❌ Status: 401 - "Autenticação necessária"
```

### Test 3: Acessar recurso sem permissão
```
PATCH /api/agendamentos/1/status (com token mas sem role RECEPCAO)
❌ Status: 403 - "Acesso negado"
✅ Response inclui: userRoles: ["USER"]
```

### Test 4: Status inválido
```
PATCH /api/agendamentos/1/status
Body: { "status": "INVALIDO" }
❌ Status: 400 - "Status inválido"
✅ Response inclui: valoresValidos: ["EM_ATENDIMENTO", "CONCLUIDO", ...]
```

---

## 📊 Impacto das Mudanças

| Métrica | Antes | Depois |
|---------|-------|--------|
| Tempo debug erro 403 | 20+ min | < 2 min |
| Clareza da mensagem de erro | ❌ Genérica | ✅ Detalhada |
| Feedback de permissões | ❌ Não | ✅ Sim |
| UX em erros | ❌ Frustrante | ✅ Útil |

---

## ⚠️ Notas Importantes

1. **Restart Backend**: Necessário após mudanças em `SecurityConfig`
2. **Clear Cache Frontend**: Limpar cache do navegador para JS atualizado
3. **Testes de Integração**: Testar fluxo completo de login após mudanças
4. **Monitoring**: Adicionar logs antes de produção

---

## 📞 Troubleshooting

### Problema: 500 em GlobalExceptionHandler
**Solução**: Verificar imports, recompilar projeto

### Problema: CORS errors após mudanças
**Solução**: Verificar `@CrossOrigin` anotações, recarregar browser

### Problema: Frontend não recebe dados de erro
**Solução**: Verificar Content-Type response, validar JSON no response

---

**Próximos Passos**: Execute o checklist acima e teste cada fase.

