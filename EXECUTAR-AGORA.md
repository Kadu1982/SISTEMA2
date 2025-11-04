# 🚀 INSTRUÇÕES URGENTES - Ana Paula UPA

## ⚠️ EXECUTE AGORA:

### OPÇÃO 1: Usar pgAdmin (Recomendado)

1. Abra o **pgAdmin**
2. Conecte ao banco **saude_db**
3. Abra o arquivo: `D:\IntelliJ\sistema2\configurar-ana-paula-upa-completo.sql`
4. Execute o script (F5)
5. Verifique as mensagens de sucesso

### OPÇÃO 2: Usar Command Line

Abra o **Command Prompt** e execute:

```cmd
cd D:\IntelliJ\sistema2
set PGPASSWORD=123456
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d saude_db -f configurar-ana-paula-upa-completo.sql
```

---

## 📋 O que este script faz:

✅ Cria/atualiza operador **operador.teste** (Ana Paula Branco)
✅ Define senha: **Teste@123**
✅ Associa ao perfil **ENFERMEIRO**
✅ Adiciona módulo **UPA** ao perfil
✅ Adiciona **10 permissões** necessárias
✅ Associa à uma unidade de saúde UPA (se disponível)

---

## 🧪 Depois de executar o SQL:

### Teste manual:
1. Acesse http://localhost:5173
2. Login: **operador.teste**
3. Senha: **Teste@123**
4. Veja se o menu lateral mostra **UPA**

### Teste automatizado (Playwright):
```cmd
cd D:\IntelliJ\sistema2
node test-ana-paula-menu-visibility.js
```

---

## ✅ Resultado esperado:

- Login funciona
- Menu lateral mostra item **UPA**
- Clique em UPA abre a página do módulo
- Screenshots salvos:
  - `ana-paula-menu-lateral.png`
  - `ana-paula-pagina-upa.png`
