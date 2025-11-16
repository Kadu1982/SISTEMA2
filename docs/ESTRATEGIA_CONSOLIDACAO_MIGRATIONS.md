# Estratégia de Consolidação de Migrations

## Problema Identificado

### Situação Atual
- **93 arquivos de migration** no diretório `db/migration`
- **Conflitos de duplicação**: A tabela `horarios_exames` foi criada em múltiplas migrations:
  - `V202510051900__consolidar_dependencias_faltantes.sql` (linha 92)
  - `V32__create_horarios_exames_bloqueios.sql` (linha 7)
- **Ordem confusa**: Migrations com numeração V1-V35 misturadas com migrations datadas (V202508180901, V202510050001, etc.)
- **Modo outOfOrder ativo**: O Flyway está rodando em modo `outOfOrder`, permitindo execução fora de ordem
- **Erro atual**: Migration V32 falha ao tentar criar `horarios_exames` que já existe

### Problemas Identificados

1. **Duplicação de tabelas**: Mesmas tabelas criadas em diferentes migrations
2. **Migrations incrementais demais**: 93 arquivos tornam difícil o gerenciamento
3. **Deploy complexo**: Dificuldade para subir em VPS com tantas migrations
4. **Manutenção difícil**: Hard de entender o estado atual do schema

## Estratégia de Solução

### Opção 1: Consolidação Total (Recomendada para novo deploy)

**Passos:**
1. Exportar schema completo do banco atual
2. Criar uma única migration `V1__initial_complete_schema.sql`
3. Mover migrations antigas para pasta `archive/`
4. Resetar o banco e aplicar apenas a nova migration

**Prós:**
- Schema limpo e organizado
- Fácil de entender
- Deploy rápido em VPS
- Menos chances de erros

**Contras:**
- Requer reset do banco (perda de histórico de migrations)
- Não compatível com bancos em produção já migrados

### Opção 2: Fix Incremental + Consolidação Futura

**Passos:**
1. Resolver conflito imediato da V32
2. Marcar migrations problemáticas como aplicadas
3. Criar nova baseline para próximos deploys
4. Manter migrations antigas para compatibilidade

**Prós:**
- Não quebra banco atual
- Compatível com produção
- Histórico preservado

**Contras:**
- Ainda mantém complexidade
- Não resolve problema de longo prazo

### Opção 3: Consolidação com Baseline (RECOMENDADA)

**Passos:**
1. **Resolver problema imediato:**
   - Deletar migration V32 duplicada (já criada em V202510051900)
   - Executar `flyway repair` para limpar estado

2. **Criar migration consolidada:**
   - Criar `V999999999999__baseline_complete_schema.sql`
   - Esta migration contém CREATE TABLE IF NOT EXISTS para TODAS as tabelas
   - Inclui todos os dados de inicialização necessários

3. **Para novos deploys (VPS limpa):**
   - Configurar `flyway.baselineVersion=999999999999`
   - Aplicar apenas a baseline
   - Sistema funcionando com 1 migration

4. **Para banco atual:**
   - Manter migrations antigas
   - Marcar baseline como aplicada
   - Novas migrations vêm depois da baseline

**Prós:**
- Resolve problema imediato
- Permite deploy limpo em VPS nova
- Compatível com banco atual
- Migração gradual

**Contras:**
- Requer manutenção de dois caminhos temporariamente

## Plano de Ação Imediato

### Etapa 1: Resolver Erro Atual (URGENTE)

```bash
# 1. Deletar V32 que está duplicada
rm backend/src/main/resources/db/migration/V32__create_horarios_exames_bloqueios.sql

# 2. Limpar target
mvn clean

# 3. Executar flyway repair
./mvnw.cmd flyway:repair

# 4. Testar startup
./mvnw.cmd spring-boot:run
```

### Etapa 2: Criar Baseline Consolidada

Criar arquivo `V999999999999__baseline_sistema_saude.sql` com:
- Todas as tabelas do sistema (CREATE TABLE IF NOT EXISTS)
- Todos os índices
- Todas as constraints
- Dados iniciais (operador master, perfis, etc.)

### Etapa 3: Documentar e Testar

- Documentar processo de deploy para VPS
- Testar em ambiente limpo
- Validar integridade dos dados

## Conflitos Detectados

| Tabela | Migration Original | Migration Conflitante |
|--------|-------------------|----------------------|
| horarios_exames | V202510051900 | V32 |
| (outros a verificar) | - | - |

## Próximos Passos

1. ✅ Decidir estratégia (Opção 3 recomendada)
2. ⏳ Resolver erro V32
3. ⏳ Criar baseline consolidada
4. ⏳ Testar deploy limpo
5. ⏳ Documentar processo
