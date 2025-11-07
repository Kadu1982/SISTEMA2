# 📋 Guia de Padronização de Perfis

## ✅ O Que Foi Implementado

### Backend
- ✅ **Novo endpoint**: `GET /perfis/tipos-disponiveis` - Lista todos os perfis padrão do sistema
- ✅ **Enum Perfil**: Define os perfis aceitos pelo sistema (MEDICO, ENFERMEIRO, RECEPCAO, etc.)
- ✅ **UserDetailsImpl**: Converte perfis em Spring Security roles automaticamente

### Frontend
- ✅ **perfilService.ts**: Serviço para listar e validar perfis
- ✅ **GerenciadorPerfis.tsx**: Componente UI para gerenciar perfis de operadores

---

## 🎯 Valores Padrão de Perfis

| Nome da Enum | Código | Descrição | Nível |
|---|---|---|---|
| `ADMINISTRADOR_DO_SISTEMA` | `ADMIN` | Administrador do Sistema | 1 |
| `GESTOR` | `GESTOR` | Gestor da Unidade | 2 |
| `MEDICO` | `MEDICO` | Médico | 3 |
| `ENFERMEIRO` | `ENFERMEIRO` | Enfermeiro | 4 |
| `TRIAGEM` | `TRIAGEM` | Profissional de Triagem | 5 |
| `DENTISTA` | `DENTISTA` | Dentista | 4 |
| `FARMACEUTICO` | `FARMACEUTICO` | Farmacêutico | 5 |
| `TECNICO_ENFERMAGEM` | `TEC_ENF` | Técnico em Enfermagem | 6 |
| `TECNICO_HIGIENE_DENTAL` | `TEC_DENTAL` | Técnico em Higiene Dental | 6 |
| `RECEPCIONISTA` | `RECEPCAO` | Recepcionista | 7 |
| `USUARIO_SISTEMA` | `USER` | Usuário do Sistema | 8 |
| `SAMU_OPERADOR` | `SAMU_OPERADOR` | Operador SAMU | 9 |
| `SAMU_REGULADOR` | `SAMU_REGULADOR` | Regulador Médico SAMU | 9 |

---

## 🔧 Como Padronizar os Dados Atuais

### Opção 1: Via SQL Direto (RÁPIDO)

Execute este comando SQL no banco de dados para padronizar os perfis existentes:

```sql
-- Limpar e padronizar perfis existentes
DELETE FROM operador_perfis;

-- Recriar com valores padrão
INSERT INTO operador_perfis (operador_id, perfil) 
SELECT DISTINCT operador_id, 'MEDICO' FROM operador_perfis 
WHERE perfil LIKE '%Médico%';

INSERT INTO operador_perfis (operador_id, perfil) 
SELECT DISTINCT operador_id, 'ENFERMEIRO' FROM operador_perfis 
WHERE perfil LIKE '%Enfermeiro%';

INSERT INTO operador_perfis (operador_id, perfil) 
SELECT DISTINCT operador_id, 'RECEPCAO' FROM operador_perfis 
WHERE perfil LIKE '%Recepcionista%';

-- ... adicione mais conforme necessário
```

### Opção 2: Via Frontend (RECOMENDADO)

1. **Acessar a página de gerenciamento de operadores**
2. **Para cada operador**:
   - Clique em editar
   - Remova os perfis antigos
   - Selecione os perfis novos usando o `GerenciadorPerfis`
   - Salve

---

## 📱 Como Usar o GerenciadorPerfis no Frontend

### Importação
```typescript
import { GerenciadorPerfis } from "@/components/GerenciadorPerfis";
```

### Exemplo de Uso
```typescript
const [perfis, setPerfis] = useState<string[]>([]);

return (
  <GerenciadorPerfis
    perfisSelecionados={perfis}
    onChange={setPerfis}
    disabled={false}
  />
);
```

### Props
- `perfisSelecionados`: Array de códigos de perfis selecionados
- `onChange`: Callback quando os perfis mudam
- `disabled`: Se true, desabilita edição

---

## ✅ Verificação Pós-Padronização

Execute na console do navegador para verificar se os perfis foram padronizados:

```typescript
// Verificar perfis do usuário logado
const operador = JSON.parse(localStorage.getItem('operadorData'));
console.log("Perfis do operador:", operador.perfis);
// Deve mostrar: ["MEDICO", "ENFERMEIRO", "RECEPCAO", etc.]
```

---

## 🚀 Próximos Passos

1. **Atualizar dados**: Padronize todos os operadores para usar os valores do Enum
2. **Testar**: Faça login com "Ana Paula Branco" e tente iniciar um atendimento
3. **Validar**: Confirme que o erro 403 desapareceu

---

## 📝 Notas Importantes

- ⚠️ Os **perfis precisam ser EXATAMENTE** como estão na Enum Perfil
- ⚠️ **Case-sensitive**: "MEDICO" ≠ "medico" ≠ "Médico"
- ⚠️ Os perfis são armazenados na tabela `operador_perfis` como `String`
- ✅ O backend converte automaticamente para `ROLE_MEDICO`, `ROLE_ENFERMEIRO`, etc. no Spring Security

---

## 🐛 Troubleshooting

### Problema: Ainda recebo 403 após padronizar

**Solução**: 
1. Verifique se o operador tem pelo menos um dos perfis permitidos
2. Limpe o localStorage e faça login novamente
3. Verifique os logs do backend: `log.debug("Permissões do usuário: {}", authentication.getAuthorities());`

### Problema: Nenhum perfil aparece no GerenciadorPerfis

**Solução**:
1. Verifique se o endpoint `/perfis/tipos-disponiveis` está acessível
2. Verifique se o backend está rodando
3. Abra o DevTools → Network e procure pela requisição GET /perfis/tipos-disponiveis

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do backend: `mvn spring-boot:run`
2. Verifique o console do navegador (F12)
3. Verifique a tabela `operador_perfis` no banco de dados


