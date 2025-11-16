# Problemas Críticos Encontrados nas Migrations

## Data: 2025-11-15

## Resumo Executivo

Foram identificados **problemas graves** nas migrations do sistema que impedem o startup da aplicação:

### 1. Migration V32 Duplicada ✅ RESOLVIDO
- **Arquivo**: `V32__create_horarios_exames_bloqueios.sql`
- **Problema**: Tabela `horarios_exames` já criada em `V202510051900__consolidar_dependencias_faltantes.sql`
- **Solução**: Arquivo deletado

### 2. Referências Incorretas à Tabela `operadores` ⚠️ CRÍTICO
- **Arquivos Afetados**:
  - `V20250820_1500__Align_security_tables.sql` ✅ CORRIGIDO
  - `V20250926_1400__criar_ambulatorio_hospitalar.sql` ❌ PENDENTE
  - `V20250928_1500__criar_modulo_internacao.sql` ❌ PENDENTE
  - `V202510012100__add_samu_perfis_to_admin.sql` ❌ PENDENTE

- **Problema**: Tabela se chama `operador` (singular), mas migrations referenciam `operadores` (plural)
- **Erro**: `ERRO: relação "public.operadores" não existe`

### 3. Migration com Sintaxe SQL Server em Sistema PostgreSQL 🔴 CRÍTICO
- **Arquivo**: `V20250926_1400__criar_ambulatorio_hospitalar.sql`
- **Problema**: Migration escrita para SQL Server, mas sistema usa PostgreSQL
- **Sintaxes incompatíveis encontradas**:
  - `BIGINT IDENTITY(1,1)` → deveria ser `BIGSERIAL`
  - `NVARCHAR` → deveria ser `VARCHAR`
  - `BIT` → deveria ser `BOOLEAN`
  - `GETDATE()` → deveria ser `NOW()` ou `CURRENT_TIMESTAMP`
  - `DATETIME2` → deveria ser `TIMESTAMP`
  - `EXEC sp_addextendedproperty` → não existe no PostgreSQL (usar `COMMENT ON`)

### 4. Quantidade Excessiva de Migrations
- **Total**: 93 arquivos de migration
- **Impacto**:
  - Difícil manutenção
  - Deploy lento
  - Complexidade alta
  - Múltiplos pontos de falha

## Solução Recomendada

### Etapa 1: Corrigir Problemas Imediatos

#### 1.1. Deletar migrations incompatíveis com PostgreSQL
```bash
rm backend/src/main/resources/db/migration/V20250926_1400__criar_ambulatorio_hospitalar.sql
```

#### 1.2. Verificar e corrigir referências a "operadores"
Precisam ser alteradas para "operador":
- V20250928_1500__criar_modulo_internacao.sql
- V202510012100__add_samu_perfis_to_admin.sql

### Etapa 2: Criar Migration Consolidada Baseline

Criar arquivo: `V999999999999__baseline_sistema_saude.sql`

Este arquivo conterá:
1. Todo o schema completo com `CREATE TABLE IF NOT EXISTS`
2. Todos os índices
3. Todas as constraints
4. Dados iniciais (operador master, perfis, etc.)
5. Comentários nas tabelas

### Etapa 3: Estratégia de Deploy

#### Para VPS Nova (Deploy Limpo):
1. Configurar Flyway com `baseline-version=999999999999`
2. Executar apenas a baseline
3. Sistema pronto em 1 migration

#### Para Banco Atual (Desenvolvimento):
1. Manter migrations antigas
2. Marcar baseline como aplicada quando necessário
3. Novas migrations após a baseline

## Ações Imediatas Necessárias

### ✅ Completadas
1. Deletar V32 duplicada
2. Corrigir V20250820_1500__Align_security_tables.sql

### ⏳ Pendentes
1. Deletar V20250926_1400__criar_ambulatorio_hospitalar.sql
2. Corrigir V20250928_1500__criar_modulo_internacao.sql
3. Corrigir V202510012100__add_samu_perfis_to_admin.sql
4. Testar startup do sistema
5. Criar baseline consolidada

## Impacto no Sistema

### Riscos Atuais
- ❌ Sistema não inicia
- ❌ Banco inconsistente
- ❌ Impossível fazer deploy

### Após Correções
- ✅ Sistema inicia normalmente
- ✅ Banco consistente
- ✅ Deploy facilitado para VPS

## Próximos Passos

1. **URGENTE**: Corrigir migrations com referência a "operadores"
2. **URGENTE**: Deletar migration SQL Server
3. Testar startup
4. Criar baseline consolidada
5. Documentar processo de deploy
