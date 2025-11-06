# 🎯 INSTRUÇÕES FINAIS - teste.operador (Ana Paula Branco) - Módulo UPA

## ✅ Login Correto Identificado:
- **Login:** teste.operador
- **Senha:** Teste@123

---

## 📋 EXECUTE ESTE SCRIPT SQL:

### Arquivo: `config-teste-operador-upa.sql`

Este script:
1. ✅ Busca o operador **teste.operador** (que JÁ EXISTE no banco)
2. ✅ Verifica o perfil atual do operador
3. ✅ Adiciona módulo **UPA** ao perfil
4. ✅ Adiciona **10 permissões** necessárias para UPA

### Como executar:

**OPÇÃO 1 - pgAdmin (Recomendado):**
1. Abra pgAdmin
2. Conecte ao banco `saude_db`
3. Abra o arquivo: `D:\IntelliJ\sistema2\config-teste-operador-upa.sql`
4. Execute (F5)
5. Veja as mensagens de sucesso no painel de saída

**OPÇÃO 2 - Command Line:**
```cmd
cd D:\IntelliJ\sistema2
set PGPASSWORD=123456
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d saude_db -f config-teste-operador-upa.sql
```

---

## 🧪 TESTE AUTOMATIZADO:

Depois de executar o SQL, rode o teste Playwright:

```cmd
cd D:\IntelliJ\sistema2
node test-ana-paula-menu-visibility.js
```

### O teste vai:
1. ✅ Fazer login com **teste.operador** / **Teste@123**
2. ✅ Aguardar dashboard carregar
3. ✅ Verificar se menu lateral está visível
4. ✅ Procurar pelo item **UPA** no menu
5. ✅ Tirar screenshot: `ana-paula-menu-lateral.png`
6. ✅ Clicar no item UPA (se visível)
7. ✅ Tirar screenshot da página UPA: `ana-paula-pagina-upa.png`

---

## ✅ Resultado Esperado:

### Sucesso:
```
✅ SUCESSO: Item UPA está VISÍVEL no menu para Ana Paula Branco!
   • O módulo UPA foi configurado corretamente
   • Ana Paula tem as permissões necessárias
```

### Falha:
```
❌ FALHA: Item UPA NÃO está visível no menu para Ana Paula Branco!
   • Verifique se o script SQL foi executado
   • Verifique se o backend foi reiniciado
```

---

## 🔍 Verificação Manual:

Se preferir testar manualmente:

1. Abra: http://localhost:5173
2. Faça login:
   - **Login:** teste.operador
   - **Senha:** Teste@123
3. Verifique se o menu lateral mostra o item **UPA**
4. Clique em **UPA** e veja se a página carrega

---

## 📦 Módulos e Permissões Adicionados:

### Módulo:
- **UPA**

### Permissões:
1. ENFERMAGEM_ATENDER
2. MEDICO_ATENDER
3. VISUALIZAR_RELATORIOS
4. GERENCIAR_PACIENTES
5. GERENCIAR_ATENDIMENTOS
6. UPA_ACESSAR
7. UPA_ATENDER
8. UPA_VISUALIZAR
9. TRIAGEM_REALIZAR
10. CLASSIFICACAO_RISCO

---

## ⚠️ IMPORTANTE:

- O script SQL NÃO cria novo operador, apenas adiciona módulo UPA ao operador existente
- O operador **teste.operador** já existe no banco (foi criado pelo frontend)
- Se o script falhar com "operador não encontrado", verifique o login no banco
- Reinicie o backend após executar o SQL para garantir que as mudanças sejam aplicadas

---

## 🛠️ Troubleshooting:

### Se o operador não for encontrado:
```sql
-- Execute este SQL para verificar:
SELECT id, login, nome FROM operador WHERE login ILIKE '%teste%';
```

### Se o módulo UPA não aparecer:
1. Reinicie o backend
2. Limpe o cache do navegador (Ctrl+Shift+Del)
3. Faça logout e login novamente

### Se quiser ver todos os dados do operador:
```sql
-- Execute: buscar-operador-real.sql
```
