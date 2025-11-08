# 🔧 Instruções: Configurar Ana Paula Branco com Módulo UPA

## ⚠️ IMPORTANTE: Execute estas etapas na ordem

### 📋 PASSO 1: Executar SQL para configurar Ana Paula

Execute o seguinte comando no terminal (cmd ou PowerShell):

```bash
cd D:\IntelliJ\sistema2
set PGPASSWORD=123456
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d saude_db -f conceder-upa-ana-paula-v2.sql
```

**OU** abra o pgAdmin e execute o arquivo `conceder-upa-ana-paula-v2.sql` manualmente.

**O que este script faz:**
- Cria ou atualiza o operador Ana Paula Branco
- Login: `operador.teste`
- Senha: `Teste@123`
- Associa ao perfil ENFERMEIRO
- Adiciona módulo UPA ao perfil
- Adiciona permissões necessárias

### 📋 PASSO 2: Reiniciar o Backend

1. **Parar o backend atual:**
   - Se estiver rodando no IntelliJ: clique em Stop
   - Se estiver rodando em terminal: Ctrl+C ou mate o processo Java

2. **Iniciar o backend novamente:**
   ```bash
   cd D:\IntelliJ\sistema2\backend
   mvnw.cmd spring-boot:run
   ```

   **OU** execute pelo IntelliJ (clique em Run)

3. **Aguardar mensagem:**
   ```
   Started BackendApplication in X seconds
   ```

### 📋 PASSO 3: Verificar se Frontend está rodando

```bash
cd D:\IntelliJ\sistema2\frontend
npm run dev
```

Deve estar rodando em: http://localhost:5173

### 📋 PASSO 4: Executar Teste Playwright

```bash
cd D:\IntelliJ\sistema2
node test-ana-paula-menu-visibility.js
```

### ✅ Resultado Esperado

O teste deve:
1. ✅ Fazer login com Ana Paula (operador.teste / Teste@123)
2. ✅ Ver o item "UPA" no menu lateral
3. ✅ Conseguir clicar e acessar a página UPA
4. ✅ Gerar screenshots:
   - `ana-paula-menu-lateral.png` - mostrando o menu
   - `ana-paula-pagina-upa.png` - mostrando a página UPA

---

## 🔍 Verificação Manual (alternativa ao Playwright)

Se o Playwright não funcionar, você pode testar manualmente:

1. Abra http://localhost:5173
2. Faça login com:
   - **Login:** operador.teste
   - **Senha:** Teste@123
3. Verifique se o menu lateral mostra o item **UPA**
4. Clique em UPA e verifique se a página carrega

---

## ❌ Troubleshooting

### Se Ana Paula não conseguir fazer login:
- Verifique se o SQL foi executado com sucesso
- Verifique no banco se o operador existe:
  ```sql
  SELECT * FROM operador WHERE login = 'operador.teste';
  ```

### Se o módulo UPA não aparecer no menu:
- Verifique se o perfil tem o módulo:
  ```sql
  SELECT p.nome, pam.modulo
  FROM perfis p
  JOIN perfil_acesso_modulos pam ON p.id = pam.perfil_id
  WHERE p.tipo = 'ENFERMEIRO';
  ```

- Verifique se Ana Paula está associada ao perfil:
  ```sql
  SELECT o.nome, p.nome as perfil, p.tipo
  FROM operador o
  JOIN operador_perfis op ON o.id = op.operador_id
  JOIN perfis p ON op.perfil_id = p.id
  WHERE o.login = 'operador.teste';
  ```

### Se o backend não reiniciar:
- Verifique se há erros de compilação
- Verifique se a porta 8080 está livre
- Mate todos os processos Java e tente novamente:
  ```bash
  tasklist | findstr java
  taskkill /F /PID <pid>
  ```

---

## 📝 Mudanças de Código Aplicadas

### Backend:

1. **UserDetailsImpl.java** - Adiciona ROLE_ADMINISTRADOR_SISTEMA para admin.master
2. **PerfilServiceImpl.java** - Filtra perfis com enums inválidos

### Frontend:

1. **operadoresService.ts** - Adiciona 18 funções faltantes
2. **ConfiguracaoService.ts** - Tratamento silencioso de erros 400/403

---

## 🎯 Objetivo Final

Ana Paula Branco deve:
- ✅ Conseguir fazer login
- ✅ Ver o módulo UPA no menu lateral
- ✅ Conseguir clicar e acessar o módulo UPA
- ✅ Ter permissões para usar funcionalidades da UPA
