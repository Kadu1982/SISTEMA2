# ❌ Erro Testsprite - Formato do Test Plan

## 🔍 Problema Identificado:

O Testsprite está rejeitando o formato do plano de testes com erro:

```
Backend error: 400 - {
  "message": [
    "testPlan.id should not be empty",
    "testPlan.id must be a string",
    "testPlan.title should not be empty",
    "testPlan.title must be a string",
    "testPlan.description should not be empty",
    "testPlan.description must be a string",
    "testPlan.steps must be an array"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

## 📋 Análise:

O Testsprite está esperando um formato específico do plano de testes que inclui:
- `testPlan.id` (string)
- `testPlan.title` (string)
- `testPlan.description` (string)
- `testPlan.steps` (array) ← **NOVO CAMPO REQUERIDO**

## 🔧 Arquivo Atual:

O arquivo `testsprite_frontend_test_plan.json` tem a estrutura:
```json
{
  "testPlan": {
    "id": "FRONTEND_OPERADORES_V1",
    "title": "...",
    "description": "...",
    "requirements": [...]
  }
}
```

Mas o Testsprite espera:
```json
{
  "testPlan": {
    "id": "...",
    "title": "...",
    "description": "...",
    "steps": [...]  ← Campo faltando
  }
}
```

## 🎯 Solução Possível:

O Testsprite pode estar esperando que o plano de testes seja **regenerado** através do MCP ou que o formato seja ajustado.

## 📝 Próximos Passos:

1. **Verificar se o Testsprite precisa regenerar o plano**
   - Talvez o plano de testes precise ser gerado novamente pelo Testsprite

2. **Ajustar o formato do arquivo**
   - Adicionar o campo `steps` no nível do `testPlan`

3. **Verificar se há versão mais recente do formato**
   - O arquivo `testsprite_frontend_test_plan.v2.json` pode ter formato diferente

4. **Contatar suporte do Testsprite**
   - Se o problema persistir, pode ser necessário verificar a documentação oficial do formato esperado

## 📊 Status Atual:

- ✅ Frontend rodando na porta 5173
- ✅ Backend rodando na porta 8080
- ✅ API Key configurada
- ✅ PRD gerado
- ✅ Planos de testes criados
- ❌ **Formato do plano de testes incompatível com a API do Testsprite**

