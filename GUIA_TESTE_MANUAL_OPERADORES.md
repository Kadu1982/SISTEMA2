# Guia de Teste Manual - Criação de Operadores

**Data:** 04/11/2025
**Objetivo:** Validar correções no fluxo de criação de operadores

## ✅ Correções Implementadas

### 1. **Tratamento de Erros - Perfis**
- ✨ Indicador de carregamento durante busca
- ⚠️ Mensagem de erro clara quando não há perfis
- 🎨 Estilização visual destacada para erros

### 2. **Tratamento de Erros - Unidades**
- ✨ Indicador de carregamento durante busca
- ⚠️ Mensagem de erro clara quando não há unidades
- 📝 Orientação ao usuário para cadastrar unidades primeiro
- 🎨 Estilização visual destacada para erros

### 3. **Validação de Salvamento**
- ✅ Validação se perfil foi selecionado
- ✅ Validação se unidade foi selecionada
- 📢 Mensagens de erro específicas para cada campo faltante

---

## 🧪 Casos de Teste

### **TESTE 1: Acesso ao Sistema**
1. Abra o navegador em `http://localhost:5173`
2. Faça login com:
   - Usuário: `admin`
   - Senha: `admin123`
3. ✅ **Esperado:** Redirecionamento para dashboard

---

### **TESTE 2: Acesso à Tela de Operadores**
1. No menu lateral, clique em **"Configurações"**
2. Clique na aba **"Operadores"**
3. Clique no botão **"Novo Operador"**
4. ✅ **Esperado:** Dialog de criação deve abrir

---

### **TESTE 3: Carregamento de Perfis**
1. Observe o campo **"Perfil de Acesso"**
2. Clique no select de perfis

#### ✅ **Cenário A: Perfis Disponíveis**
- Deve mostrar lista de perfis (Admin, Recepcionista, Médico, etc.)
- ✅ **Esperado:** Lista carregada com sucesso

#### ⚠️ **Cenário B: Sem Perfis (Banco Vazio)**
- Deve mostrar: **"⚠️ Nenhum perfil de acesso cadastrado no sistema."**
- Cor de texto: Vermelho (destructive)
- ✅ **Esperado:** Mensagem de erro clara e visível

---

### **TESTE 4: Carregamento de Unidades**
1. Observe o campo **"Unidade de Saúde"**
2. Clique no select de unidades

#### ✅ **Cenário A: Unidades Disponíveis**
- Deve mostrar lista de unidades (UPA Central, ESF Jardim, etc.)
- ✅ **Esperado:** Lista carregada com sucesso

#### ⚠️ **Cenário B: Sem Unidades (Banco Vazio)**
- Deve mostrar: **"⚠️ Nenhuma unidade de saúde cadastrada no sistema."**
- Abaixo: **"Por favor, cadastre uma unidade antes de criar operadores."**
- Cor de texto: Vermelho (destructive)
- ✅ **Esperado:** Mensagem de erro clara com orientação

---

### **TESTE 5: Indicadores de Carregamento**
1. Abra o dialog de criação
2. Observe os selects antes de carregar os dados

#### ✅ **Esperado:**
- **Perfis:** Mostrar "⏳ Carregando perfis de acesso..."
- **Unidades:** Mostrar "⏳ Carregando unidades de saúde..."
- Ícone de spinner animado deve estar visível

---

### **TESTE 6: Validação ao Salvar (SEM Perfil)**
1. Preencha apenas:
   - Nome: "João Silva"
   - Email: "joao@teste.com"
   - CPF: "12345678901"
   - Usuário: "joao.silva"
   - Senha: "Senha123!"
2. **NÃO selecione** perfil ou unidade
3. Clique em **"Criar Operador"**

#### ✅ **Esperado:**
- Mensagem de erro: **"Por favor, selecione um perfil de acesso"**
- Operador NÃO deve ser criado

---

### **TESTE 7: Validação ao Salvar (SEM Unidade)**
1. Preencha todos os campos
2. Selecione um **Perfil**
3. **NÃO selecione** unidade
4. Clique em **"Criar Operador"**

#### ✅ **Esperado:**
- Mensagem de erro: **"Por favor, selecione uma unidade de saúde"**
- Operador NÃO deve ser criado

---

### **TESTE 8: Criação Completa (SUCESSO)**
1. Preencha todos os campos:
   - Nome: "Maria Oliveira"
   - Email: "maria@teste.com"
   - CPF: "98765432100"
   - Usuário: "maria.oliveira"
   - Senha: "Senha123!"
2. Selecione um **Perfil**: "Recepcionista"
3. Selecione uma **Unidade**: "UPA Central"
4. Clique em **"Criar Operador"**

#### ✅ **Esperado:**
- Mensagem de sucesso: **"Operador criado com sucesso!"**
- Dialog deve fechar
- Operador deve aparecer na tabela
- Dados devem estar corretos

---

## 📊 Checklist de Validação

### Interface do Usuário
- [ ] Indicadores de carregamento aparecem
- [ ] Mensagens de erro são claras e visíveis
- [ ] Cores e ícones estão corretos (vermelho para erros)
- [ ] Orientações ao usuário são úteis

### Funcionalidade
- [ ] Perfis carregam corretamente
- [ ] Unidades carregam corretamente
- [ ] Validação de perfil funciona
- [ ] Validação de unidade funciona
- [ ] Criação completa funciona
- [ ] Operador aparece na tabela após criação

### Experiência do Usuário
- [ ] Mensagens são amigáveis
- [ ] Usuário sabe o que fazer quando há erro
- [ ] Feedback visual é adequado
- [ ] Não há confusão sobre o que está acontecendo

---

## 📝 Observações Importantes

### Arquivos Alterados
1. **backend/src/main/resources/db/migration/V20251104_0900__insert_test_data.sql**
   - Inserção de perfis e unidades de teste

2. **frontend/src/pages/configuracoes/CriarOperadorDialog.tsx**
   - Linhas 365-382: Tratamento de erros de perfis
   - Linhas 503-528: Tratamento de erros de unidades
   - Linha 606: Validação de perfil ao salvar
   - Linha 610: Validação de unidade ao salvar

### Dados de Teste no Banco
```sql
-- Perfis
- Admin (ID: 1)
- Recepcionista (ID: 2)
- Médico (ID: 3)
- Enfermeiro (ID: 4)
- Farmacêutico (ID: 5)
- Técnico de Laboratório (ID: 6)

-- Unidades
- UPA Central (ID: 1)
- ESF Jardim das Flores (ID: 2)
- Hospital Municipal (ID: 3)
- Laboratório Central (ID: 4)
```

---

## 🐛 Como Reportar Problemas

Se encontrar algum problema, documente:

1. **Passo a passo** para reproduzir
2. **Comportamento esperado** vs **comportamento real**
3. **Screenshot** da tela
4. **Console do navegador** (F12 → Console)
5. **Logs do backend** (se aplicável)

---

## ✅ Resultado Esperado Final

Após todas as correções:
- ✅ Usuário sempre sabe o estado do carregamento
- ✅ Mensagens de erro são claras e orientam o usuário
- ✅ Validações impedem criação incompleta
- ✅ Interface é amigável e profissional
- ✅ Não há confusão sobre o que fazer em caso de erro
