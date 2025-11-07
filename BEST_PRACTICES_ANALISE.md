# 🎯 Análise Completa - Melhores Práticas para o Sistema SISTEMA2

## 📊 Resumo Executivo

Baseado na análise do histórico de erros e nas melhores práticas do Context7, este documento apresenta a arquitetura ideal para o sistema, consolidando:
- ✅ 5 Erros Identificados e Resolvidos
- ✅ Problemas de Exception Handling
- ✅ Segurança com JWT e Spring Security
- ✅ Mapeamento de Dados com MapStruct
- ✅ Tratamento de Autenticação e Autorização

---

## 🔍 Erros Resolvidos - Análise

### 1️⃣ **Erro 403 Forbidden - GET /api/unidades**

**Problema:** Frontend não conseguia buscar lista de unidades na tela de login.

**Causa Raiz:**
- Endpoint não estava configurado como público em `SecurityFilterChain`
- JWT filter tentava validar token mesmo sem autenticação

**Solução Aplicada:**
```java
// ✅ CORRETO - SecurityConfig.java
.authorizeHttpRequests(auth -> auth
    .requestMatchers(HttpMethod.GET, "/api/unidades").permitAll()
    .anyRequest().authenticated()
)
```

**Lição:** Endpoints públicos precisam ser explicitamente configurados.

---

### 2️⃣ **Login Pop-up HTTP Basic - Browser Auth Dialog**

**Problema:** Browser exibindo pop-up nativo de autenticação básica ao falhar login.

**Causa Raiz:**
- Spring Security enviava header `WWW-Authenticate: Basic`
- Browser interpretava como autenticação HTTP básica

**Solução Aplicada:**
```java
// ✅ CORRETO - SecurityConfig.java
.exceptionHandling(exceptions -> exceptions
    .authenticationEntryPoint((request, response, authException) -> {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(
            "{\"success\":false,\"message\":\"Token de autenticação necessário\",\"data\":null}"
        );
    })
)
```

**Lição:** Sempre retornar JSON em REST APIs, nunca contar com headers de autenticação.

---

### 3️⃣ **Erro 400 Bad Request - Status Update**

**Problema:** Validação incorreta ao atualizar status de agendamento.

**Causa Raiz:**
- Spring tentava mapear `Map<String, String>` diretamente
- Sem validação explícita do enum

**Solução Aplicada:**
```java
// ✅ CORRETO - Usar DTO com validação
@Data
public class AtualizarStatusAgendamentoRequest {
    @NotBlank(message = "Status é obrigatório")
    private String status;
}

// No Controller:
@PatchMapping("/{id}/status")
public ResponseEntity<?> atualizarStatus(
        @PathVariable Long id,
        @RequestBody AtualizarStatusAgendamentoRequest request,
        Authentication authentication) {
    
    String novoStatus = request.getStatus().trim().toUpperCase();
    
    // Validação explícita
    try {
        StatusAgendamento.valueOf(novoStatus);
    } catch (IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of(
            "error", "Status inválido",
            "statusRecebido", novoStatus,
            "valoresValidos", Arrays.stream(StatusAgendamento.values())
                .map(Enum::name)
                .collect(Collectors.toList())
        ));
    }
    // ...
}
```

**Lição:** Use DTOs para request binding, adicione validação explícita de enums.

---

### 4️⃣ **Error Access Denied - Sem Feedback de Permissões**

**Problema:** Erro 403 sem indicar quais permissões o usuário possui ou precisa.

**Causa Raiz:**
- Handler genérico de `AccessDeniedException`
- Sem contexto de quais roles o usuário tinha

**Solução Aplicada:**
```java
// ✅ CORRETO - GlobalExceptionHandler.java
@ExceptionHandler(AccessDeniedException.class)
public ResponseEntity<ApiResponse<Map<String, Object>>> handleAccessDeniedException(
        AccessDeniedException ex,
        Authentication authentication) {
    
    Map<String, Object> details = new HashMap<>();
    
    if (authentication != null) {
        List<String> userRoles = authentication.getAuthorities().stream()
            .map(a -> a.getAuthority().replace("ROLE_", ""))
            .sorted()
            .collect(Collectors.toList());
        
        details.put("userRoles", userRoles);
        details.put("message", String.format(
            "Acesso negado. Suas permissões atuais: %s",
            userRoles.isEmpty() ? "Nenhuma" : String.join(", ", userRoles)
        ));
    }
    
    ApiResponse<Map<String, Object>> response = new ApiResponse<>(
        false, 
        details.get("message").toString(), 
        details
    );
    return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
}
```

**No Frontend:**
```typescript
// ✅ CORRETO - AtendimentoMedico.tsx
if (lastError?.response?.status === 403) {
    const userRoles = errorData?.data?.userRoles || [];
    let description = errorMessage;
    
    if (userRoles.length > 0) {
        description += `\n\n🔐 Suas permissões atuais: ${userRoles.join(", ") || "Nenhuma"}`;
    }
    description += "\n\nEntre em contato com o administrador para obter as permissões necessárias.";
    
    toast({
        title: "Acesso Negado",
        description,
        variant: "destructive",
    });
}
```

**Lição:** Sempre forneça contexto sobre qual é o problema de acesso.

---

### 5️⃣ **Erro 500 Internal Server Error - Listagem de Unidades**

**Problema:** Erro genérico 500 ao buscar unidades após compilação.

**Causa Raiz:**
- Erro no MapStruct ao mapear tipos
- Sem logging detalhado do que estava falhando

**Solução Aplicada:**
```java
// ✅ CORRETO - UnidadeSaudeMapper.java
@Mapper(componentModel = "spring")
public interface UnidadeSaudeMapper {
    
    @Mapping(target = "tipoDescricao", expression = "java(getTipoDescricao(entity))")
    @Mapping(target = "enderecoCompleto", expression = "java(buildEnderecoCompleto(entity))")
    @Mapping(target = "perfisPermitidos", expression = "java(convertSetToStringList(entity.getPerfisPermitidos()))")
    UnidadeSaudeDTO toDTO(UnidadeSaude entity);
    
    // ✅ NOVO: Método auxiliar com tratamento de erro
    default String getTipoDescricao(UnidadeSaude entity) {
        try {
            if (entity == null || entity.getTipo() == null) {
                return null;
            }
            return entity.getTipo().getDescricao();
        } catch (Exception e) {
            return null;
        }
    }
    
    // ✅ NOVO: Com try-catch
    default String buildEnderecoCompleto(UnidadeSaude entity) {
        try {
            if (entity == null) return null;
            // ... lógica de construção
            return resultado;
        } catch (Exception e) {
            return null;
        }
    }
}
```

**No Controller:**
```java
// ✅ CORRETO - UnidadeSaudeController.java
@GetMapping
public ResponseEntity<?> listar() {
    try {
        List<UnidadeSaudeDTO> unidades = unidadeService.listarTodas();
        return ResponseEntity.ok(unidades);
    } catch (Exception e) {
        System.err.println("❌ Erro ao listar unidades: " + e.getMessage());
        System.err.println("Causa: " + (e.getCause() != null ? e.getCause().getMessage() : "N/A"));
        e.printStackTrace();
        
        String mensagem = e.getMessage() != null ? e.getMessage() : "Erro desconhecido";
        if (e.getCause() != null) {
            mensagem += ". Causa: " + e.getCause().getMessage();
        }
        
        return ResponseEntity.status(500).body(Map.of(
            "success", false,
            "error", "Erro ao listar unidades",
            "message", mensagem,
            "data", null
        ));
    }
}
```

**No Serviço:**
```java
// ✅ NOVO - Logging detalhado
public List<UnidadeSaudeDTO> listarTodas() {
    try {
        logger.debug("Buscando unidades do repositório...");
        List<UnidadeSaude> entidades = unidadeRepo.findAll();
        logger.debug("Encontradas {} unidades", entidades.size());
        
        List<UnidadeSaudeDTO> unidades = entidades.stream()
            .map(entity -> {
                try {
                    return unidadeMapper.toDTO(entity);
                } catch (Exception e) {
                    logger.error("Erro ao converter unidade {}: {}", 
                        entity?.getId(), e.getMessage(), e);
                    // ... fallback básico
                    return criarDtoBasico(entity);
                }
            })
            .collect(Collectors.toList());
        
        cacheListaUnidades = unidades;
        cacheListaTimestamp = System.currentTimeMillis();
        
        return unidades;
    } catch (Exception e) {
        logger.error("Erro ao listar unidades: {}", e.getMessage(), e);
        throw new RuntimeException("Erro ao listar unidades: " + e.getMessage(), e);
    }
}
```

**Lição:** Mapear com segurança (null-safe), logar tudo, e retornar erros detalhados.

---

## 📋 Arquitetura Recomendada - Best Practices

### 1. **Exception Handling Strategy (Spring Boot)**

```java
// 📁 backend/src/main/java/com/sistemadesaude/backend/exception/

// ✅ 1. Exception Handler Global
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    // Autenticação falhou
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<?>> handleAuthenticationException(
            AuthenticationException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(ApiResponse.error("Autenticação falhou: " + ex.getMessage()));
    }
    
    // Acesso negado
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleAccessDeniedException(
            AccessDeniedException ex,
            Authentication authentication) {
        
        Map<String, Object> details = new HashMap<>();
        if (authentication != null) {
            List<String> roles = authentication.getAuthorities().stream()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .sorted()
                .collect(Collectors.toList());
            details.put("userRoles", roles);
        }
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(ApiResponse.error("Acesso negado", details));
    }
    
    // Validação falhou
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidationException(
            MethodArgumentNotValidException ex) {
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
            .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error("Validação falhou", errors));
    }
    
    // Recurso não encontrado
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleEntityNotFoundException(
            EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error(ex.getMessage()));
    }
    
    // Erro genérico
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleGenericException(Exception ex) {
        log.error("Erro não tratado", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.error("Erro interno do servidor"));
    }
}

// ✅ 2. Classe ApiResponse padronizada
@Data
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }
    
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }
    
    public static <T> ApiResponse<T> error(String message, T data) {
        return new ApiResponse<>(false, message, data);
    }
}
```

---

### 2. **Security Configuration - Spring Security 6**

```java
// 📁 backend/src/main/java/com/sistemadesaude/backend/config/

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@Slf4j
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // ✅ CORS e CSRF
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()))
            
            // ✅ Exception Handling
            .exceptionHandling(exceptions -> exceptions
                // Autenticação necessária
                .authenticationEntryPoint(new CustomAuthenticationEntryPoint())
                // Acesso negado
                .accessDeniedHandler(new CustomAccessDeniedHandler())
            )
            
            // ✅ Autorização HTTP
            .authorizeHttpRequests(auth -> auth
                // Públicos
                .requestMatchers(HttpMethod.GET, "/api/unidades").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/health").permitAll()
                
                // Requer autenticação
                .anyRequest().authenticated()
            )
            
            // ✅ JWT - OAuth2 Resource Server
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .jwtAuthenticationConverter(jwtAuthenticationConverter())
                )
            )
            
            // ✅ Logout
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .logoutSuccessHandler((request, response, authentication) -> {
                    response.setStatus(HttpServletResponse.SC_OK);
                    response.getWriter().write("{\"message\":\"Logout realizado com sucesso\"}");
                })
            );
        
        return http.build();
    }
    
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter converter = new JwtGrantedAuthoritiesConverter();
        converter.setAuthoritiesClaimName("roles");
        converter.setAuthorityPrefix("ROLE_");
        
        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(converter);
        
        return jwtAuthenticationConverter;
    }
}

// ✅ Custom Authentication Entry Point
@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {
    
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException authException) throws IOException {
        
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        
        String json = new ObjectMapper().writeValueAsString(
            ApiResponse.error("Token de autenticação necessário ou inválido")
        );
        
        response.getWriter().write(json);
    }
}

// ✅ Custom Access Denied Handler
@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {
    
    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
            AccessDeniedException accessDeniedException) throws IOException {
        
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json;charset=UTF-8");
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        List<String> roles = auth != null ? 
            auth.getAuthorities().stream()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .sorted()
                .collect(Collectors.toList()) : List.of();
        
        Map<String, Object> details = Map.of(
            "userRoles", roles,
            "message", "Acesso negado. Permissões atuais: " + 
                (roles.isEmpty() ? "Nenhuma" : String.join(", ", roles))
        );
        
        String json = new ObjectMapper().writeValueAsString(
            ApiResponse.error("Acesso negado", details)
        );
        
        response.getWriter().write(json);
    }
}
```

---

### 3. **Mapeamento com MapStruct - Best Practices**

```java
// 📁 backend/src/main/java/com/sistemadesaude/backend/unidadesaude/mapper/

@Mapper(componentModel = "spring")
public interface UnidadeSaudeMapper {
    
    // ✅ 1. Mapeamento completo com null-safety
    @Mapping(target = "tipoDescricao", expression = "java(getTipoDescricao(entity))")
    @Mapping(target = "enderecoCompleto", expression = "java(buildEnderecoCompleto(entity))")
    @Mapping(target = "perfisPermitidos", expression = "java(convertSetToStringList(entity.getPerfisPermitidos()))")
    UnidadeSaudeDTO toDTO(UnidadeSaude entity);
    
    // ✅ 2. Conversão segura de tipos
    default String getTipoDescricao(UnidadeSaude entity) {
        try {
            if (entity == null || entity.getTipo() == null) {
                return null;
            }
            return entity.getTipo().getDescricao();
        } catch (Exception e) {
            log.error("Erro ao obter tipo: {}", e.getMessage());
            return null;
        }
    }
    
    // ✅ 3. Construção com validação
    default String buildEnderecoCompleto(UnidadeSaude entity) {
        try {
            if (entity == null) return null;
            
            StringBuilder sb = new StringBuilder();
            
            if (hasValue(entity.getEndereco())) {
                sb.append(entity.getEndereco());
            }
            
            if (hasValue(entity.getCidade())) {
                if (sb.length() > 0) sb.append(", ");
                sb.append(entity.getCidade());
            }
            
            if (hasValue(entity.getEstado())) {
                if (sb.length() > 0) sb.append(" - ");
                sb.append(entity.getEstado().toUpperCase());
            }
            
            return sb.length() > 0 ? sb.toString() : null;
        } catch (Exception e) {
            log.error("Erro ao construir endereço: {}", e.getMessage());
            return null;
        }
    }
    
    // ✅ 4. Conversão de coleções com segurança
    default List<String> convertSetToStringList(Set<String> set) {
        try {
            return set != null && !set.isEmpty() ? 
                new ArrayList<>(set) : new ArrayList<>();
        } catch (Exception e) {
            log.error("Erro ao converter set: {}", e.getMessage());
            return new ArrayList<>();
        }
    }
    
    // ✅ 5. Validação de string
    default boolean hasValue(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
```

---

### 4. **Controller com Validação Completa**

```java
// 📁 backend/src/main/java/com/sistemadesaude/backend/recepcao/controller/

@RestController
@RequestMapping("/api/agendamentos")
@Validated
@Slf4j
public class AgendamentoController {
    
    // ✅ PATCH - Atualizar status
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('RECEPCAO', 'ADMIN', 'MEDICO', 'ENFERMEIRO')")
    public ResponseEntity<?> atualizarStatus(
            @PathVariable @Positive Long id,
            @RequestBody @Valid AtualizarStatusAgendamentoRequest request,
            Authentication authentication) {
        
        log.info("🔄 Atualizando status do agendamento {}", id);
        log.debug("Permissões do usuário: {}", authentication.getAuthorities());
        
        try {
            if (request == null || request.getStatus() == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Status é obrigatório"));
            }
            
            String novoStatus = request.getStatus().trim().toUpperCase();
            
            // ✅ Validação de enum
            try {
                StatusAgendamento.valueOf(novoStatus);
            } catch (IllegalArgumentException e) {
                log.warn("Status inválido: {}", novoStatus);
                return ResponseEntity.badRequest()
                    .body(Map.of(
                        "error", "Status inválido",
                        "statusRecebido", novoStatus,
                        "valoresValidos", Arrays.stream(StatusAgendamento.values())
                            .map(Enum::name)
                            .collect(Collectors.toList())
                    ));
            }
            
            AgendamentoDTO result = agendamentoService.atualizarStatus(id, novoStatus);
            log.info("✅ Status atualizado com sucesso");
            
            return ResponseEntity.ok(result);
            
        } catch (AccessDeniedException e) {
            log.warn("Acesso negado: {}", e.getMessage());
            throw e;
        } catch (EntityNotFoundException e) {
            log.warn("Agendamento não encontrado: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("❌ Erro ao atualizar status: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(Map.of(
                    "error", "Erro ao atualizar status",
                    "message", e.getMessage()
                ));
        }
    }
}

// ✅ DTO com validação
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AtualizarStatusAgendamentoRequest {
    
    @NotBlank(message = "Status é obrigatório")
    @Size(min = 3, max = 50, message = "Status deve ter entre 3 e 50 caracteres")
    private String status;
}
```

---

### 5. **Frontend - Error Handling Pattern**

```typescript
// 📁 frontend/src/services/apiErrorHandler.ts

export interface ApiErrorResponse {
  success: boolean;
  message: string;
  data?: {
    userRoles?: string[];
    [key: string]: any;
  };
}

export const handleApiError = (error: any): {
  status: number;
  message: string;
  details?: any;
  userRoles?: string[];
} => {
  // ✅ 403 - Acesso negado com contexto de permissões
  if (error?.response?.status === 403) {
    const errorData = error.response.data as ApiErrorResponse;
    return {
      status: 403,
      message: errorData?.message || "Acesso negado",
      userRoles: errorData?.data?.userRoles || [],
      details: errorData?.data,
    };
  }
  
  // ✅ 401 - Não autenticado
  if (error?.response?.status === 401) {
    return {
      status: 401,
      message: "Token inválido ou expirado. Faça login novamente.",
    };
  }
  
  // ✅ 400 - Validação falhou
  if (error?.response?.status === 400) {
    const errorData = error.response.data;
    return {
      status: 400,
      message: errorData?.message || "Dados inválidos",
      details: errorData?.data || errorData,
    };
  }
  
  // ✅ 404 - Não encontrado
  if (error?.response?.status === 404) {
    return {
      status: 404,
      message: "Recurso não encontrado",
    };
  }
  
  // ✅ 500 - Erro do servidor
  if (error?.response?.status === 500) {
    const errorData = error.response.data;
    return {
      status: 500,
      message: errorData?.message || "Erro no servidor",
      details: errorData?.data,
    };
  }
  
  // ✅ Erro desconhecido
  return {
    status: error?.response?.status || 0,
    message: error?.message || "Erro desconhecido",
  };
};

// ✅ Uso em componentes
export const atualizarStatusAgendamento = async (id: number, status: string) => {
  try {
    await apiService.patch(`/agendamentos/${id}/status`, { status });
    toast.success("Status atualizado com sucesso!");
  } catch (error: any) {
    const { status, message, userRoles, details } = handleApiError(error);
    
    if (status === 403) {
      const rolesList = userRoles?.length 
        ? userRoles.join(", ") 
        : "Nenhuma";
        
      toast.error(
        `${message}\n\nSuas permissões: ${rolesList}\n\nContate o administrador.`,
        { duration: 10000 }
      );
    } else {
      toast.error(message);
    }
  }
};
```

---

## 🎯 Checklist Final - Implementação

- [x] **Exception Handling Global**
  - [x] AuthenticationException
  - [x] AccessDeniedException
  - [x] Validation Exceptions
  - [x] Entity Not Found
  - [x] Generic Exception

- [x] **Security Configuration**
  - [x] JWT Authentication
  - [x] Custom Entry Points
  - [x] Custom Access Denied Handlers
  - [x] Role-based Authorization

- [x] **MapStruct Mappings**
  - [x] Null-safe methods
  - [x] Error handling in expressions
  - [x] Type conversions
  - [x] Collection mappings

- [x] **API Responses**
  - [x] Standardized ApiResponse
  - [x] Error details with context
  - [x] User-friendly messages
  - [x] Debug information on server

- [x] **Frontend Error Handling**
  - [x] Centralized error handler
  - [x] Permission feedback
  - [x] User guidance
  - [x] Toast notifications

---

## 📚 Referências Context7

- **Spring Boot Error Handling**: `/websites/spring_io_spring-boot`
- **MapStruct Best Practices**: `/mapstruct/mapstruct`
- **Spring Security JWT**: `/spring-projects/spring-security`
- **Global Exception Handler Pattern**: `/clutcher/spring-security-exception-handler`

---

## 🚀 Próximos Passos

1. **Implementar em Produção**
   - [ ] Configurar logging centralizado (ELK, CloudWatch)
   - [ ] Adicionar monitoring com Actuator
   - [ ] Implementar circuit breakers para chamadas externas

2. **Testes**
   - [ ] Unit tests para exception handlers
   - [ ] Integration tests para segurança
   - [ ] E2E tests para fluxo de autenticação

3. **Documentação**
   - [ ] OpenAPI/Swagger com exemplos de erro
   - [ ] Runbooks para troubleshooting comum
   - [ ] Troubleshooting guide para permissões

---

**Versão**: 1.0  
**Data**: 2025-11-06  
**Análise Baseada em**: Context7 + Spring Boot Best Practices

