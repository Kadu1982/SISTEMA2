# Resumo da Análise e Correções das Migrations

**Data:** 2025-11-15
**Situação Inicial:** Sistema não iniciava devido a erros nas migrations
**Objetivo:** Corrigir erros e consolidar migrations para deploy em VPS

---

## Problemas Encontrados e Corrigidos

###  ✅ 1. Migration V32 Duplicada
- **Problema:** Tabela `horarios_exames` criada em duas migrations
  - V32__create_horarios_exames_bloqueios.sql
  - V202510051900__consolidar_dependencias_faltantes.sql
- **Solução:** Deletado arquivo V32 duplicado
- **Status:** RESOLVIDO

### ✅ 2. Referências Incorretas à Tabela `operadores`
- **Problema:** Tabela se chama `operador` (singular), mas múltiplas migrations referenciam `operadores` (plural)
- **Arquivos Corrigidos:**
  - V20250820_1500__Align_security_tables.sql
  - V20250928_1500__criar_modulo_internacao.sql (4 ocorrências)
- **Solução:** Substituído `operadores` por `operador` em todas as FKs
- **Status:** RESOLVIDO

### ✅ 3. Migration SQL Server em Sistema PostgreSQL
- **Problema:** V20250926_1400__criar_ambulatorio_hospitalar.sql escrita para SQL Server
- **Sintaxes incompatíveis:**
  - `BIGINT IDENTITY(1,1)` → incompatível com PostgreSQL
  - `NVARCHAR` → deveria ser `VARCHAR`
  - `BIT` → deveria ser `BOOLEAN`
  - `GETDATE()` → deveria ser `NOW()` ou `CURRENT_TIMESTAMP`
  - `DATETIME2` → deveria ser `TIMESTAMP`
  - `EXEC sp_addextendedproperty` → não existe no PostgreSQL
- **Solução:** Arquivo deletado (tabelas criadas em outras migrations)
- **Status:** RESOLVIDO

### ✅ 4. Migration Hospitalar Duplicada
- **Problema:** V20250923_1500__criar_modulo_hospitalar.sql duplicada
- **Tabelas já criadas em:**
  - V202509251207__create_configuracao_hospitalar_table.sql
  - V202509251209__create_fila_atendimento_table.sql
- **Solução:** Arquivo deletado
- **Status:** RESOLVIDO

### ⚠️ 5. Migration Internação com Problemas
- **Problema:** V20250928_1500__criar_modulo_internacao.sql com erros
- **Correções Aplicadas:**
  - Adicionado `IF NOT EXISTS` em todas as CREATE TABLE
  - Corrigido referências `operadores` → `operador`
- **Status:** PARCIALMENTE RESOLVIDO (ainda com erro de coluna inexistente)

---

## Estatísticas

### Arquivos de Migration
- **Total Original:** 93 arquivos
- **Deletados:** 3 arquivos (V32, V20250926_1400, V20250923_1500)
- **Modificados:** 3 arquivos
- **Total Atual:** 90 arquivos

### Problemas Resolvidos
- ✅ Migrations duplicadas: 3
- ✅ Referências incorretas: 5 ocorrências
- ✅ Incompatibilidade SQL Server/PostgreSQL: 1
- ⚠️ Migrations com erros restantes: 1+

---

## Análise da Situação Atual

### Complexidade Identificada

O projeto possui **90+ migrations** com os seguintes problemas:

1. **Duplicações**: Múltiplas migrations criam as mesmas tabelas
2. **Ordem Confusa**: Numeração V1-V35 misturada com timestamps (V202508180901...)
3. **Modo outOfOrder**: Flyway rodando em modo `outOfOrder`, permitindo execução fora de ordem
4. **Falta de IF NOT EXISTS**: Muitas migrations sem proteção contra execução duplicada
5. **Inconsistências**: Nomes de tabelas (operador vs operadores)
6. **Mix de Sintaxes**: Algumas migrations com sintaxe SQL Server

### Tempo Estimado para Corrigir Todas as Migrations

- **Corrigir individualmente**: 8-12 horas
- **Testar cada correção**: 4-6 horas
- **Total**: 12-18 horas de trabalho

---

## Recomendação: MIGRATION BASELINE CONSOLIDADA

Em vez de corrigir 90+ migrations individuais, a solução recomendada é:

### Criar Uma Migration Baseline Única

**Arquivo:** `V999999999999__baseline_sistema_saude.sql`

**Conteúdo:**
1. Todos os `CREATE TABLE IF NOT EXISTS` de todas as tabelas do sistema
2. Todos os `CREATE INDEX IF NOT EXISTS` necessários
3. Todas as constraints (FKs, CHECKs)
4. Dados iniciais (operador master, perfis, permissões)
5. Comentários nas tabelas

**Vantagens:**
- ✅ **1 arquivo** em vez de 90+
- ✅ Deploy em VPS **rápido e limpo**
- ✅ Fácil manutenção
- ✅ Menos chances de erros
- ✅ Ideal para novos ambientes

### Estratégia de Implementação

#### Para VPS Nova (Deploy Limpo):
```properties
# application.properties
flyway.baseline-version=999999999999
flyway.baseline-on-migrate=true
```

**Resultado:** Sistema sobe com apenas 1 migration

#### Para Banco Atual (Desenvolvimento):
1. Manter migrations antigas
2. Adicionar baseline após a última migration
3. Novas migrations usam numeração após baseline

---

## Próximos Passos Recomendados

### Opção 1: Continuar Correções Individuais
- **Tempo:** 12-18 horas
- **Risco:** Alto (podem surgir novos erros)
- **Benefício:** Mantém histórico completo

### Opção 2: Criar Baseline Consolidada (RECOMENDADO)
- **Tempo:** 2-4 horas
- **Risco:** Baixo
- **Benefício:** Solução definitiva e escalável

---

## Arquivos Criados Durante a Análise

1. `docs/ESTRATEGIA_CONSOLIDACAO_MIGRATIONS.md`
   - Estratégias detalhadas de consolidação

2. `docs/PROBLEMAS_CRITICOS_MIGRATIONS.md`
   - Problemas críticos identificados

3. `docs/RESUMO_ANALISE_E_CORRECOES_MIGRATIONS.md` (este arquivo)
   - Resumo completo do trabalho realizado

---

## Conclusão

Foram corrigidos **problemas críticos** que impediam o startup do sistema. No entanto, devido à **complexidade** e **quantidade** de migrations (90+), a **recomendação técnica** é:

### 🎯 CRIAR MIGRATION BASELINE CONSOLIDADA

Isso vai:
- Resolver todos os problemas de uma vez
- Facilitar deploy em VPS
- Reduzir tempo de startup
- Simplificar manutenção futura

**Decisão:** Aguardando definição do usuário sobre qual caminho seguir.

---

## Comandos Úteis para Verificação

```bash
# Verificar estado do Flyway
./mvnw.cmd flyway:info

# Reparar schema history
./mvnw.cmd flyway:repair

# Contar migrations
dir "src\main\resources\db\migration\*.sql" | Measure-Object

# Ver última migration aplicada
psql -U postgres -d saude_db -c "SELECT version, description FROM flyway_schema_history ORDER BY installed_rank DESC LIMIT 5;"
```

---

**Autor:** Claude Code
**Versão:** 1.0
**Status:** Análise Completa - Aguardando Decisão
