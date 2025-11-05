# 📚 Documentação de Testes - Sistema de Saúde

## 🎯 Visão Geral

Esta pasta contém toda a documentação de especificação e testes para o módulo de **Login e Gestão de Operadores** do Sistema de Saúde. A documentação foi gerada usando TestSprite MCP e metodologia de testes automatizados.

---

## 📂 Estrutura de Arquivos

```
testsprite_tests/tmp/prd_files/
├── README.md                          # Este arquivo - Índice geral
├── REGAS_LOGIN_OPERADORES.md          # Regras de negócio do login
├── ESPECIFICACAO_TESTES_LOGIN.md      # Especificação técnica completa
├── CENARIOS_TESTE_DETALHADOS.md       # Cenários BDD (Given/When/Then)
└── API_REFERENCE.md                   # Referência completa da API
```

---

## 📖 Guia de Leitura

### Para Desenvolvedores
1. Comece com `REGAS_LOGIN_OPERADORES.md` para entender as regras de negócio
2. Consulte `API_REFERENCE.md` para detalhes dos endpoints
3. Use `ESPECIFICACAO_TESTES_LOGIN.md` para casos de teste

### Para QA/Testers
1. Leia `ESPECIFICACAO_TESTES_LOGIN.md` para visão geral dos testes
2. Use `CENARIOS_TESTE_DETALHADOS.md` para executar testes manuais
3. Consulte `API_REFERENCE.md` para validar responses

### Para Product Owners
1. Revise `REGAS_LOGIN_OPERADORES.md` para validar regras de negócio
2. Confira `CENARIOS_TESTE_DETALHADOS.md` para entender fluxos

---

## 📄 Descrição dos Documentos

### 1. REGAS_LOGIN_OPERADORES.md
**Conteúdo:**
- Processo de autenticação completo
- Validação de horários de acesso
- Regras do operador master (admin.master)
- Regras de criação de operadores
- Fluxo completo de login
- Casos de bloqueio

**Quando usar:**
- Implementar novas features de autenticação
- Entender por que um login foi bloqueado
- Validar regras de negócio
- Onboarding de novos desenvolvedores

---

### 2. ESPECIFICACAO_TESTES_LOGIN.md
**Conteúdo:**
- Arquitetura técnica (Backend + Frontend)
- 15 casos de teste detalhados (TC-001 a TC-015)
- Suite de Autenticação (7 testes)
- Suite de Gestão de Operadores (8 testes)
- Matriz de rastreabilidade
- Personas de teste
- Métricas de qualidade
- Considerações de segurança
- Ambiente de testes
- Checklist de execução

**Quando usar:**
- Escrever testes automatizados
- Validar cobertura de testes
- Planejar sprints de testes
- Documentar bugs encontrados

---

### 3. CENARIOS_TESTE_DETALHADOS.md
**Conteúdo:**
- 14 cenários no formato BDD (Given/When/Then)
- Suite de Autenticação (5 cenários)
- Suite de Gestão de Operadores (4 cenários)
- Suite de Segurança (3 cenários)
- Suite de Performance (2 cenários)
- Validações técnicas (código + SQL)
- Resumo estatístico
- Checklist de execução

**Quando usar:**
- Executar testes manuais
- Criar testes automatizados com Playwright/Cypress
- Validar comportamentos esperados
- Reproduzir bugs

---

### 4. API_REFERENCE.md
**Conteúdo:**
- Documentação completa de todos os endpoints
- POST /auth/login - Autenticação
- GET/POST/PUT/DELETE /operadores - CRUD de operadores
- PUT /operadores/{id}/perfis - Gestão de perfis
- PUT /operadores/{id}/unidades - Gestão de unidades
- GET /perfis - Lista de perfis
- GET /unidades - Lista de unidades
- Códigos de status HTTP
- Exemplos de uso (JavaScript)
- Troubleshooting

**Quando usar:**
- Integrar frontend com backend
- Debugar chamadas de API
- Escrever testes de integração
- Documentar para terceiros

---

## 🧪 Resumo dos Testes

### Cobertura Total
- **Total de Casos de Teste:** 15
- **Prioridade Crítica/Alta:** 13
- **Prioridade Média:** 1
- **Prioridade Baixa:** 0

### Distribuição por Suite
| Suite | Casos de Teste | Status |
|-------|----------------|--------|
| Autenticação | 7 | ✅ Especificado |
| Gestão de Operadores | 8 | ✅ Especificado |
| Segurança | 3 | ✅ Especificado |
| Performance | 2 | ✅ Especificado |

### Cenários BDD
| Suite | Cenários | Status |
|-------|----------|--------|
| Autenticação | 5 | ✅ Documentado |
| Gestão | 4 | ✅ Documentado |
| Segurança | 3 | ✅ Documentado |
| Performance | 2 | ✅ Documentado |

---

## 🔑 Informações Importantes

### Credenciais de Teste

#### Operador Master
```
Login: admin.master
Senha: Admin@123
Perfis: ADMINISTRADOR_SISTEMA
Características: Acesso irrestrito, ignora horários
```

#### Operador Normal (Exemplo)
```
Login: operador.teste
Senha: Teste@123
Perfis: UPA
Características: Sujeito a horários (se definidos)
```

### Endpoints Principais
```
Base URL: http://localhost:8080/api

POST /auth/login          # Autenticação
GET  /operadores          # Listar operadores
POST /operadores          # Criar operador
PUT  /operadores/{id}     # Atualizar operador
```

### Banco de Dados
```
SGBD: PostgreSQL
Database: saude_db (dev) / saude_test (test)
Porta: 5432
Migrations: Flyway
```

---

## 🚀 Como Executar os Testes

### 1. Preparar Ambiente

```bash
# Backend
cd backend
./mvnw spring-boot:run

# Frontend
cd frontend
npm install
npm run dev
```

### 2. Verificar Requisitos
- [ ] Backend rodando na porta 8080
- [ ] Frontend rodando na porta 5173
- [ ] PostgreSQL ativo
- [ ] Operador master criado
- [ ] Perfis e unidades de teste disponíveis

### 3. Executar Testes Manuais
- Abra `CENARIOS_TESTE_DETALHADOS.md`
- Siga os passos de cada cenário (Given/When/Then)
- Valide os resultados esperados

### 4. Executar Testes Automatizados
```bash
# Testes de API com Playwright (futuro)
npm run test:api

# Testes E2E com Playwright (futuro)
npm run test:e2e

# Testes unitários
npm run test
```

---

## 📊 Métricas de Qualidade

### Critérios de Aceitação
- ✅ 100% dos casos críticos devem passar
- ✅ 95% de cobertura de código nos módulos testados
- ✅ Tempo de resposta < 2s para login
- ✅ Tempo de resposta < 3s para criação de operador

### KPIs
- **Taxa de Sucesso:** > 95%
- **Cobertura de Testes:** > 80%
- **Bugs Críticos:** 0
- **Performance:** 100% dos requests < 3s

---

## 🔐 Segurança

### Proteções Implementadas
1. **Autenticação:** JWT com expiração de 24h
2. **Senhas:** Hash BCrypt (custo 10)
3. **Operador Master:** Não pode ser alterado/deletado
4. **Rate Limiting:** 5 tentativas de login/min
5. **Validação de Horários:** Bloqueia acesso fora do horário
6. **CORS:** Configurado para origins permitidos

---

## 🐛 Reportar Bugs

### Template de Bug
```markdown
**Título:** [Módulo] Descrição curta

**Descrição:**
- O que aconteceu
- O que era esperado
- Como reproduzir

**Ambiente:**
- SO: Windows/Linux/Mac
- Browser: Chrome/Firefox/Safari
- Versão: X.Y.Z

**Evidências:**
- Screenshots
- Logs
- Network tab

**Prioridade:** Crítica/Alta/Média/Baixa

**Caso de Teste Relacionado:** TC-XXX
```

---

## 📝 Histórico de Versões

| Versão | Data | Autor | Descrição |
|--------|------|-------|-----------|
| 1.0.0 | 2025-11-04 | Claude Code | Documentação inicial completa |

---

## 🤝 Contribuindo

### Para Adicionar Novos Testes
1. Adicione o caso de teste em `ESPECIFICACAO_TESTES_LOGIN.md`
2. Crie o cenário BDD em `CENARIOS_TESTE_DETALHADOS.md`
3. Atualize a matriz de rastreabilidade
4. Atualize este README

### Para Atualizar Regras de Negócio
1. Atualize `REGAS_LOGIN_OPERADORES.md`
2. Revise casos de teste afetados
3. Atualize cenários BDD se necessário

### Para Adicionar Endpoints
1. Documente em `API_REFERENCE.md`
2. Adicione exemplos de uso
3. Crie casos de teste correspondentes

---

## 📞 Contato e Suporte

Para dúvidas sobre esta documentação:
- **Equipe de Desenvolvimento:** dev@sistema-saude.com
- **Equipe de QA:** qa@sistema-saude.com
- **Product Owner:** po@sistema-saude.com

---

## 📚 Referências Externas

- [Spring Security Documentation](https://spring.io/projects/spring-security)
- [JWT.io](https://jwt.io/)
- [Playwright Documentation](https://playwright.dev/)
- [TestSprite Documentation](https://www.testsprite.com/docs)
- [BDD Best Practices](https://cucumber.io/docs/bdd/)

---

**Última atualização:** 04/11/2025  
**Versão da Documentação:** 1.0.0  
**Status:** ✅ Completo e Pronto para Uso

