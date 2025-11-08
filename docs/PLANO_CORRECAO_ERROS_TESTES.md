# Plano de Correção - Erros Encontrados nos Testes de Criação de Operadores

## 📋 Resumo dos Erros Identificados

### ✅ Funcionando Corretamente
1. ✅ Login como admin.master
2. ✅ Navegação pelo menu lateral para Configurações > Operadores
3. ✅ Abertura do diálogo de criação de operador
4. ✅ Preenchimento do formulário (nome, login, senha, CPF, email)

### ❌ Erros Encontrados
1. ❌ **Perfis não disponíveis**: O Select de perfis não tem opções ou não carregou
2. ❌ **Unidades não disponíveis**: Checkboxes de unidades não aparecem ou não carregaram
3. ❌ **Validação falha**: Erro "Preencha os dados para criar um novo usuário" - faltam perfis e unidades selecionados
4. ❌ **Edição não testada**: Não foi possível testar edição porque o operador não foi criado

---

## 🔍 Análise Detalhada dos Erros

### Erro 1: Perfis não disponíveis no Select

**Sintoma:**
- O Select de perfis abre, mas não mostra opções disponíveis
- Mensagem: "Nenhuma opção de perfil disponível no Select"

**Possíveis Causas:**
1. **Backend não retorna perfis**: API `/perfis` ou `/configuracoes/perfis` não retorna dados
2. **Erro no carregamento**: Função `carregarPerfis()` falha silenciosamente
3. **Filtro muito restritivo**: Perfis existem mas são filtrados incorretamente
4. **Problema de autenticação**: Token JWT não está sendo enviado corretamente na requisição
5. **Estado não atualizado**: Componente não atualiza após carregar perfis

**Arquivos a Verificar:**
- `frontend/src/pages/configuracoes/CriarOperadorDialog.tsx` (linhas 60-70)
- `frontend/src/services/perfisService.ts` ou `ConfiguracaoService.ts`
- `backend/src/main/java/.../perfil/controller/PerfilController.java`
- Network tab do navegador durante o teste

### Erro 2: Unidades não disponíveis

**Sintoma:**
- Checkboxes de unidades não aparecem no dialog
- Mensagem: "Checkboxes de unidades não encontrados no dialog"

**Possíveis Causas:**
1. **Backend não retorna unidades**: API `/unidades` ou `/configuracoes/unidades` não retorna dados
2. **Erro no carregamento**: Função `carregarUnidades()` falha silenciosamente
3. **Estado de loading infinito**: Componente fica em "Carregando unidades..."
4. **Problema de autenticação**: Token JWT não está sendo enviado corretamente
5. **Renderização condicional**: Componente não renderiza quando `unidadesDisponiveis` está vazio

**Arquivos a Verificar:**
- `frontend/src/pages/configuracoes/CriarOperadorDialog.tsx` (linhas 72-82)
- `frontend/src/services/unidadesService.ts` ou similar
- `backend/src/main/java/.../unidade/controller/UnidadeController.java`
- Network tab do navegador durante o teste

### Erro 3: Validação falha ao salvar

**Sintoma:**
- Erro: "Preencha os dados para criar um novo usuário"
- Operador não é criado

**Possíveis Causas:**
1. **Validação no frontend**: Função `criarOperador()` valida antes de enviar
   - `perfisSelecionados.length === 0` → Erro: "Selecione pelo menos um perfil"
   - `unidadesSelecionadas.length === 0` → Erro: "Selecione pelo menos uma unidade de saúde"
   - `!unidadePrincipal` → Erro: "Defina uma unidade principal"
2. **Validação no backend**: Backend também valida e retorna erro
3. **Estado não sincronizado**: Perfis/unidades selecionados não estão no estado do componente

**Arquivos a Verificar:**
- `frontend/src/pages/configuracoes/CriarOperadorDialog.tsx` (linhas 158-217)
- `backend/src/main/java/.../operador/controller/OperadorController.java`
- Console do navegador durante o teste

---

## 🛠️ Plano de Correção

### Fase 1: Diagnóstico e Verificação (Prioridade ALTA)

#### 1.1 Verificar se há dados no banco de dados
```sql
-- Verificar perfis cadastrados
SELECT * FROM perfil WHERE ativo = true;

-- Verificar unidades cadastradas
SELECT * FROM unidade_saude WHERE ativo = true;
```

**Ação:** Se não houver dados, criar dados de teste via migrations ou seeders.

#### 1.2 Verificar APIs do Backend

**Teste 1: API de Perfis**
```bash
# Via curl ou Postman
curl -X GET "http://localhost:8080/api/perfis" \
  -H "Authorization: Bearer {TOKEN_JWT}" \
  -H "Content-Type: application/json"
```

**Teste 2: API de Unidades**
```bash
# Via curl ou Postman
curl -X GET "http://localhost:8080/api/unidades" \
  -H "Authorization: Bearer {TOKEN_JWT}" \
  -H "Content-Type: application/json"
```

**Ação:** 
- Se retornar 401/403 → Problema de autenticação/autorização
- Se retornar 200 com array vazio → Não há dados cadastrados
- Se retornar 500 → Erro no backend (verificar logs)

#### 1.3 Verificar Network Tab do Navegador

**Durante o teste:**
1. Abrir DevTools (F12)
2. Ir para aba Network
3. Filtrar por XHR/Fetch
4. Procurar requisições para:
   - `/perfis` ou `/configuracoes/perfis`
   - `/unidades` ou `/configuracoes/unidades`
5. Verificar:
   - Status code (200, 401, 403, 500)
   - Response body (dados retornados)
   - Headers (Authorization presente?)

---

### Fase 2: Correções no Frontend (Prioridade ALTA)

#### 2.1 Melhorar Tratamento de Erros no Carregamento de Perfis

**Arquivo:** `frontend/src/pages/configuracoes/CriarOperadorDialog.tsx`

**Problema Atual:**
```typescript
const carregarPerfis = async () => {
    setCarregandoPerfis(true);
    try {
        const perfis = await perfisService.listarPerfis();
        setPerfisDisponiveis(perfis);
    } catch (error) {
        console.error('Erro ao carregar perfis:', error);
        // ❌ Erro silencioso - usuário não sabe o que aconteceu
    } finally {
        setCarregandoPerfis(false);
    }
};
```

**Correção Proposta:**
```typescript
const carregarPerfis = async () => {
    setCarregandoPerfis(true);
    setErro(''); // Limpar erros anteriores
    try {
        const perfis = await perfisService.listarPerfis();
        if (!perfis || perfis.length === 0) {
            setErro('Nenhum perfil cadastrado no sistema. Por favor, cadastre um perfil primeiro.');
            setPerfisDisponiveis([]);
        } else {
            setPerfisDisponiveis(perfis);
        }
    } catch (error: any) {
        console.error('Erro ao carregar perfis:', error);
        const mensagem = error?.response?.data?.message || error?.message || 'Erro ao carregar perfis';
        setErro(`Erro ao carregar perfis: ${mensagem}`);
        setPerfisDisponiveis([]);
        // ✅ Mostrar erro para o usuário
    } finally {
        setCarregandoPerfis(false);
    }
};
```

#### 2.2 Melhorar Tratamento de Erros no Carregamento de Unidades

**Arquivo:** `frontend/src/pages/configuracoes/CriarOperadorDialog.tsx`

**Problema Atual:**
```typescript
const carregarUnidades = async () => {
    setCarregandoUnidades(true);
    try {
        const response = await listarUnidades();
        setUnidadesDisponiveis(response.content || []);
    } catch (error) {
        console.error('Erro ao carregar unidades:', error);
        // ❌ Erro silencioso
    } finally {
        setCarregandoUnidades(false);
    }
};
```

**Correção Proposta:**
```typescript
const carregarUnidades = async () => {
    setCarregandoUnidades(true);
    setErro(''); // Limpar erros anteriores
    try {
        const response = await listarUnidades();
        const unidades = response.content || [];
        if (unidades.length === 0) {
            setErro('Nenhuma unidade de saúde cadastrada no sistema. Por favor, cadastre uma unidade primeiro.');
            setUnidadesDisponiveis([]);
        } else {
            setUnidadesDisponiveis(unidades);
        }
    } catch (error: any) {
        console.error('Erro ao carregar unidades:', error);
        const mensagem = error?.response?.data?.message || error?.message || 'Erro ao carregar unidades';
        setErro(`Erro ao carregar unidades: ${mensagem}`);
        setUnidadesDisponiveis([]);
        // ✅ Mostrar erro para o usuário
    } finally {
        setCarregandoUnidades(false);
    }
};
```

#### 2.3 Melhorar Mensagens de Validação

**Arquivo:** `frontend/src/pages/configuracoes/CriarOperadorDialog.tsx`

**Problema Atual:**
```typescript
const criarOperador = async () => {
    // Validações
    if (!nome || !login || !senha || !cpf) {
        setErro('Preencha todos os campos obrigatórios');
        return;
    }

    if (perfisSelecionados.length === 0) {
        setErro('Selecione pelo menos um perfil');
        return;
    }

    if (unidadesSelecionadas.length === 0) {
        setErro('Selecione pelo menos uma unidade de saúde');
        return;
    }

    if (!unidadePrincipal) {
        setErro('Defina uma unidade principal');
        return;
    }
    // ...
};
```

**Correção Proposta:**
```typescript
const criarOperador = async () => {
    // Validações com mensagens mais específicas
    if (!nome || !login || !senha || !cpf) {
        setErro('Preencha todos os campos obrigatórios (Nome, Login, Senha, CPF)');
        return;
    }

    if (perfisSelecionados.length === 0) {
        if (perfisDisponiveis.length === 0) {
            setErro('Nenhum perfil disponível. Por favor, cadastre um perfil primeiro.');
        } else {
            setErro('Selecione pelo menos um perfil de acesso');
        }
        return;
    }

    if (unidadesSelecionadas.length === 0) {
        if (unidadesDisponiveis.length === 0) {
            setErro('Nenhuma unidade de saúde disponível. Por favor, cadastre uma unidade primeiro.');
        } else {
            setErro('Selecione pelo menos uma unidade de saúde');
        }
        return;
    }

    if (!unidadePrincipal) {
        setErro('Defina uma unidade principal para o operador');
        return;
    }
    // ...
};
```

#### 2.4 Adicionar Indicadores Visuais de Carregamento

**Melhorar UI para mostrar quando está carregando:**
```typescript
// No Select de perfis
{carregandoPerfis ? (
    <div className="p-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
        Carregando perfis...
    </div>
) : perfisDisponiveis.length === 0 ? (
    <div className="p-2 text-sm text-destructive">
        ⚠️ Nenhum perfil cadastrado. Cadastre um perfil primeiro.
    </div>
) : (
    // Select normal
)}

// Na lista de unidades
{carregandoUnidades ? (
    <div className="p-4 text-center text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
        Carregando unidades...
    </div>
) : unidadesDisponiveis.length === 0 ? (
    <div className="p-4 text-center text-sm text-destructive">
        ⚠️ Nenhuma unidade cadastrada. Cadastre uma unidade primeiro.
    </div>
) : (
    // Lista normal
)}
```

---

### Fase 3: Correções no Backend (Prioridade MÉDIA)

#### 3.1 Verificar Endpoints de Perfis

**Arquivo:** `backend/src/main/java/.../perfil/controller/PerfilController.java`

**Verificar:**
1. Endpoint existe e está mapeado corretamente
2. Retorna perfis ativos
3. Requer autenticação/autorização correta
4. Trata erros adequadamente

**Exemplo de correção:**
```java
@GetMapping
@PreAuthorize("hasRole('ADMINISTRADOR_SISTEMA') or hasAuthority('CONFIGURACOES_READ')")
public ResponseEntity<List<PerfilDTO>> listarPerfis() {
    try {
        List<Perfil> perfis = perfilService.listarPerfisAtivos();
        if (perfis.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList()); // ✅ Retorna array vazio, não erro
        }
        List<PerfilDTO> dtos = perfis.stream()
            .map(perfilMapper::toDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    } catch (Exception e) {
        log.error("Erro ao listar perfis", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .build();
    }
}
```

#### 3.2 Verificar Endpoints de Unidades

**Arquivo:** `backend/src/main/java/.../unidade/controller/UnidadeController.java`

**Verificar:**
1. Endpoint existe e está mapeado corretamente
2. Retorna unidades ativas
3. Requer autenticação/autorização correta
4. Trata erros adequadamente

---

### Fase 4: Dados de Teste (Prioridade ALTA)

#### 4.1 Criar Migration para Dados Iniciais

**Arquivo:** `backend/src/main/resources/db/migration/V4__Insert_Dados_Teste.sql`

```sql
-- Inserir perfis de teste se não existirem
INSERT INTO perfil (nome, tipo, ativo, descricao)
SELECT 'UPA', 'UPA', true, 'Perfil para Unidade de Pronto Atendimento'
WHERE NOT EXISTS (SELECT 1 FROM perfil WHERE tipo = 'UPA');

INSERT INTO perfil (nome, tipo, ativo, descricao)
SELECT 'RECEPCIONISTA_UPA', 'RECEPCIONISTA_UPA', true, 'Perfil para Recepcionista de UPA'
WHERE NOT EXISTS (SELECT 1 FROM perfil WHERE tipo = 'RECEPCIONISTA_UPA');

INSERT INTO perfil (nome, tipo, ativo, descricao)
SELECT 'ADMINISTRADOR_SISTEMA', 'ADMINISTRADOR_SISTEMA', true, 'Administrador do Sistema'
WHERE NOT EXISTS (SELECT 1 FROM perfil WHERE tipo = 'ADMINISTRADOR_SISTEMA');

-- Inserir unidades de teste se não existirem
INSERT INTO unidade_saude (nome, tipo, ativo, endereco)
SELECT 'UBS Central', 'UBS', true, 'Endereço da UBS Central'
WHERE NOT EXISTS (SELECT 1 FROM unidade_saude WHERE nome = 'UBS Central');

INSERT INTO unidade_saude (nome, tipo, ativo, endereco)
SELECT 'UPA Norte', 'UPA', true, 'Endereço da UPA Norte'
WHERE NOT EXISTS (SELECT 1 FROM unidade_saude WHERE nome = 'UPA Norte');
```

#### 4.2 Verificar Seeders ou Dados Iniciais

**Verificar se há:**
- Scripts de seed
- Dados iniciais em migrations anteriores
- Dados de teste em desenvolvimento

---

### Fase 5: Melhorias no Teste (Prioridade BAIXA)

#### 5.1 Adicionar Verificações de Dados Disponíveis

**No teste, antes de tentar criar operador:**
```javascript
// Verificar se há perfis disponíveis
const hasPerfis = await page.evaluate(() => {
  const select = document.querySelector('[role="combobox"]');
  if (!select) return false;
  const options = document.querySelectorAll('[role="option"]');
  return options.length > 0;
});

if (!hasPerfis) {
  logTest('Verificar perfis disponíveis', false, 'Nenhum perfil cadastrado no sistema');
  // Pular testes de criação
}

// Verificar se há unidades disponíveis
const hasUnidades = await page.evaluate(() => {
  const checkboxes = document.querySelectorAll('[role="dialog"] input[type="checkbox"]');
  return checkboxes.length > 0;
});

if (!hasUnidades) {
  logTest('Verificar unidades disponíveis', false, 'Nenhuma unidade cadastrada no sistema');
  // Pular testes de criação
}
```

#### 5.2 Adicionar Screenshots de Debug

**Capturar screenshots quando encontrar erros:**
```javascript
if (errorMessage) {
  await page.screenshot({ path: `test-screenshots/erro-salvar-${Date.now()}.png`, fullPage: true });
  logTest('Teste 6: Salvar operador', false, `Erro ao salvar: ${erroText}`);
}
```

---

## 📊 Priorização das Correções

### 🔴 ALTA PRIORIDADE (Fazer Primeiro)
1. ✅ Verificar se há perfis e unidades no banco de dados
2. ✅ Criar dados de teste via migration se necessário
3. ✅ Melhorar tratamento de erros no frontend (mostrar mensagens claras)
4. ✅ Verificar se APIs estão funcionando (Network tab)

### 🟡 MÉDIA PRIORIDADE (Fazer Depois)
5. ✅ Verificar endpoints do backend
6. ✅ Melhorar mensagens de validação
7. ✅ Adicionar indicadores visuais de carregamento

### 🟢 BAIXA PRIORIDADE (Melhorias)
8. ✅ Melhorar testes automatizados
9. ✅ Adicionar screenshots de debug
10. ✅ Adicionar verificações de dados disponíveis

---

## 🧪 Como Testar as Correções

### 1. Teste Manual
1. Fazer login como admin.master
2. Navegar pelo menu lateral para Configurações > Operadores
3. Clicar em "Novo Operador"
4. Verificar se perfis aparecem no Select
5. Verificar se unidades aparecem na lista
6. Preencher formulário e tentar criar operador

### 2. Teste Automatizado
```bash
cd D:\IntelliJ\sistema2
node testar_criacao_operadores_correto.js
```

### 3. Verificar Logs
- Console do navegador (F12)
- Network tab (requisições e respostas)
- Logs do backend (Spring Boot)

---

## 📝 Checklist de Correção

- [ ] Verificar dados no banco de dados
- [ ] Criar migration com dados de teste
- [ ] Testar APIs de perfis e unidades
- [ ] Corrigir tratamento de erros no frontend
- [ ] Melhorar mensagens de validação
- [ ] Adicionar indicadores visuais de carregamento
- [ ] Verificar endpoints do backend
- [ ] Rodar testes automatizados novamente
- [ ] Verificar se todos os testes passam

---

## 🎯 Resultado Esperado

Após aplicar as correções:
- ✅ Perfis aparecem no Select e podem ser selecionados
- ✅ Unidades aparecem na lista e podem ser selecionadas
- ✅ Operador é criado com sucesso
- ✅ Mensagens de erro são claras e informativas
- ✅ Usuário sabe exatamente o que está faltando

---

**Data de Criação:** 2025-01-07
**Última Atualização:** 2025-01-07
**Status:** Aguardando Implementação

