# 📊 Estrutura Completa do Banco de Dados

## 🎯 Análise Detalhada - Sistema de Saúde

**Data da Análise:** 04/10/2025
**Total de Módulos:** 20
**Total de Entidades:** 154
**Total de Migrations:** 64

---

## 📋 DADOS INICIAIS OBRIGATÓRIOS

### 1️⃣ **Módulo CORE (Obrigatório para funcionamento)**

#### ✅ Unidades de Saúde (`unidades_saude`)
**Migration:** `V1__Initial_Schema.sql`
**Dados Criados:**
```sql
-- Unidade Padrão (ID = 1)
INSERT INTO unidades_saude (nome, codigo_cnes, tipo, ativa, data_criacao, criado_por)
VALUES ('Unidade de Saúde Padrão', '0000001', 'UBS', TRUE, NOW(), 'sistema');
```
**❗ IMPORTANTE:** Essa unidade é referenciada em várias outras migrations!

---

#### ✅ Perfis de Acesso (`perfis`)
**Migration:** `V1__Initial_Schema.sql`
**Dados Criados:**
```sql
-- 10 perfis padrão do sistema
- ADMINISTRADOR_SISTEMA
- RECEPCIONISTA
- MEDICO
- ENFERMEIRO
- FARMACEUTICO
- DENTISTA
- TECNICO_ENFERMAGEM
- TECNICO_HIGIENE_DENTAL
- GESTOR
- USUARIO_SISTEMA
```

---

#### ✅ Operador Master (`operador`)
**Migration:** `V3__Insert_Operador_Master.sql`
**Dados Criados:**
```sql
Login: admin.master
Senha: Admin@123 (hash bcrypt)
Perfil: ADMINISTRADOR_SISTEMA
Unidade: ID 1 (Unidade Padrão)
```
**❗ IMPORTANTE:** Esse operador é usado em várias migrations como `operador_criacao_id`!

---

###Human: continue
### 2️⃣ **Módulo LABORATÓRIO (Tabelas de Referência)**

#### ✅ Grupos de Exames (`lab_grupo_exame`)
**Migration:** `V31__insert_laboratorio_initial_data.sql`
**Dados Criados:**
- HEMATO - Hematologia
- BIOQ - Bioquímica  
- URINA - Urinálise
- MICRO - Microbiologia
- IMUNO - Imunologia
- HORM - Hormônios
- PARASITO - Parasitologia

---

#### ✅ Materiais de Exame (`lab_material_exame`)
**Migration:** `V31__insert_laboratorio_initial_data.sql`
**Dados Criados:**
- SANG - Sangue (tubo amarelo)
- SANGFL - Sangue (tubo roxo - EDTA)
- SANGCIT - Sangue (tubo azul - citrato)
- URINA - Urina
- URINA24 - Urina 24h
- FEZES - Fezes
- ESCARRO - Escarro
- SWAB - Swab

---

#### ✅ Exames Cadastrados (`lab_exame`)
**Migration:** `V31__insert_laboratorio_initial_data.sql`
**Exames Hematologia:**
- HEM001 - Hemograma Completo
- HEM002 - Contagem de Plaquetas
- HEM003 - Tempo de Coagulação (TC)
- HEM004 - Tempo de Sangramento (TS)

**Exames Bioquímica:**
- BIOQ001 - Glicemia em Jejum
- BIOQ002 - Colesterol Total
- BIOQ003 - HDL Colesterol
- BIOQ004 - LDL Colesterol
- BIOQ005 - Triglicerídeos
- BIOQ006 - Ureia
- BIOQ007 - Creatinina

**Exames Urina:**
- URI001 - EAS (Exame de Urina Tipo I)
- URI002 - Urinocultura com Antibiograma

---

#### ✅ Motivos de Exame (`lab_motivo_exame`)
**Migration:** `V31__insert_laboratorio_initial_data.sql`
- PREV - Prevenção
- DIAG - Diagnóstico
- ACOMP - Acompanhamento
- PREO - Pré-operatório
- URG - Urgência/Emergência

---

#### ✅ Motivos de Nova Coleta (`lab_motivo_nova_coleta`)
**Migration:** `V31__insert_laboratorio_initial_data.sql`
- INSUF - Amostra insuficiente
- HEMOL - Amostra hemolisada
- COAG - Amostra coagulada
- CONT - Amostra contaminada
- IDENT - Erro de identificação

---

### 3️⃣ **Módulo IMUNIZAÇÃO (Vacinas)**

#### ✅ Vacinas Cadastradas (`imun_vacinas`)
**Migration:** `V202509180001__create_imunizacao_tables.sql`
**Dados Criados (14 vacinas):**
- BCG - Bacilo Calmette-Guérin
- HEPA-B - Hepatite B
- PENTA - Pentavalente (DTP/Hib/HepB)
- VIP - Vacina Inativada Poliomielite
- VOP - Vacina Oral Poliomielite
- ROTA - Rotavírus Humano
- PNEUMO10 - Pneumocócica 10-valente
- MENINGO-C - Meningocócica C
- SRC - Sarampo, Caxumba, Rubéola
- TETRA - Tetravalente (DTP/Hib)
- DTP - Tríplice Bacteriana
- COVID-19 - COVID-19
- INFLUENZA - Influenza
- HEPATITE-A - Hepatite A

---

### 4️⃣ **Módulo SAMU (Tabelas de Referência)**

#### ✅ Tipos de Solicitante (`samu_tipo_solicitante`)
**Migration:** `V202510012200__create_samu_module.sql`
- Próprio Paciente
- Familiar
- Terceiro
- Unidade de Saúde
- Polícia

---

#### ✅ Tipos de Ligação (`samu_tipo_ligacao`)
**Migration:** `V202510012200__create_samu_module.sql`
- Emergência
- Urgência
- Trote
- Informação
- Falso Alarme

---

#### ✅ Origem da Solicitação (`samu_origem_solicitacao`)
**Migration:** `V202510012200__create_samu_module.sql`
- Telefone 192
- Unidade de Saúde
- Polícia/Bombeiros
- Rádio
- Sistema Integrado

---

#### ✅ Tipos de Encaminhamento (`samu_tipo_encaminhamento`)
**Migration:** `V202510012200__create_samu_module.sql`
- Encaminhar Ambulância
- Orientação Telefônica
- Encaminhar UBS
- Encaminhar Hospital
- Negado

---

#### ✅ Tipos de Encaminhamento SAMU (`tipos_encaminhamento_samu`)
**Migration:** `V202510021300__create_tipos_encaminhamento_samu_table.sql`
- Hospital
- UPA
- UBS
- Recusa de Atendimento
- Óbito no Local
- Transferência Inter-Hospitalar
- Retorno à Base
- Cancelamento

---

### 5️⃣ **Módulo AMBULATÓRIO HOSPITALAR**

#### ✅ Configurações (`ambulatorio_configuracoes`)
**Migration:** `V20250926_1400__criar_ambulatorio_hospitalar.sql`
**Dados Criados (14 configurações):**
- HORARIO_FUNCIONAMENTO_INICIO: '07:00'
- HORARIO_FUNCIONAMENTO_FIM: '17:00'
- INTERVALO_PADRAO_CONSULTA: '30' minutos
- MAXIMO_AGENDAMENTOS_DIA: '50'
- PERMITE_AGENDAMENTO_MESMO_DIA: 'false'
- DIAS_ANTECEDENCIA_AGENDAMENTO: '60'
- PERMITE_ENCAIXE: 'true'
- MAXIMO_ENCAIXES_DIA: '5'
- TEMPO_TOLERANCIA_ATRASO: '15' minutos
- PERMITE_REAGENDAMENTO: 'true'
- NOTIFICACAO_CONFIRMACAO_ATIVA: 'true'
- DIAS_CONFIRMACAO_ANTECIPADA: '1'
- PERMITE_RETORNO_AUTOMATICO: 'true'
- DIAS_PADRAO_RETORNO: '30'

**❗ IMPORTANTE:** Todas usam `operador_criacao_id = 1` (admin.master)

---

### 6️⃣ **Módulo HOSPITALAR**

#### ✅ Configurações Hospitalares (`configuracao_hospitalar`)
**Migration:** `V20250923_1500__criar_modulo_hospitalar.sql`
- Configurações padrão de atendimento hospitalar
- Definições de enfermarias
- Regras de internação

---

#### ✅ Fila de Atendimento (`fila_atendimento`)
**Migration:** `V20250923_1500__criar_modulo_hospitalar.sql`
- Configuração padrão da fila de atendimento

---

## 📊 RESUMO ESTATÍSTICO

### Dados Obrigatórios por Módulo:

| Módulo | Tabelas com Dados | Total de Registros |
|--------|-------------------|--------------------|
| **Core** | 3 | ~12 registros |
| **Laboratório** | 5 | ~35 registros |
| **Imunização** | 1 | 14 registros |
| **SAMU** | 5 | ~25 registros |
| **Ambulatório** | 1 | 14 registros |
| **Hospitalar** | 2 | ~5 registros |
| **TOTAL** | **17 tabelas** | **~105 registros** |

---

## ⚠️ DEPENDÊNCIAS CRÍTICAS

### Ordem de Criação Obrigatória:

```
1. unidades_saude (ID = 1) ← PRIMEIRO!
   ↓
2. perfis (sistema)
   ↓
3. operador (admin.master, ID = 1) ← SEGUNDO!
   ↓
4. operador_perfis
   ↓
5. operador_unidade
   ↓
6. Demais tabelas de referência (podem ser em qualquer ordem)
```

**❗ ATENÇÃO:**
- O operador `admin.master` (ID = 1) é referenciado em TODAS as migrations que inserem dados
- A unidade padrão (ID = 1) é referenciada em várias migrations
- Se qualquer um desses não existir, as migrations falharão!

---

## ✅ VERIFICAÇÃO

### Tabelas que DEVEM ter dados após migrations:

```sql
-- 1. Verificar Unidade Padrão
SELECT * FROM unidades_saude WHERE id = 1;

-- 2. Verificar Operador Master
SELECT * FROM operador WHERE login = 'admin.master';

-- 3. Verificar Perfis
SELECT COUNT(*) FROM perfis; -- Deve retornar >= 10

-- 4. Verificar Exames de Laboratório
SELECT COUNT(*) FROM lab_exame; -- Deve retornar >= 11

-- 5. Verificar Vacinas
SELECT COUNT(*) FROM imun_vacinas; -- Deve retornar 14

-- 6. Verificar Configurações SAMU
SELECT COUNT(*) FROM samu_tipo_solicitante; -- Deve retornar 5
SELECT COUNT(*) FROM samu_tipo_ligacao; -- Deve retornar 5
SELECT COUNT(*) FROM samu_origem_solicitacao; -- Deve retornar 5

-- 7. Verificar Configurações Ambulatório
SELECT COUNT(*) FROM ambulatorio_configuracoes; -- Deve retornar 14
```

---

## 🚨 PROBLEMAS IDENTIFICADOS E CORRIGIDOS

### 1. ✅ Migration V20250910 - Tabela triagens
**Problema:** Tentava modificar tabela antes dela existir
**Solução:** Adicionada verificação `IF EXISTS`

### 2. ✅ Migrations V20250926_1400 e V20250928_1500
**Problema:** Sintaxe SQL Server em ambiente PostgreSQL
**Soluções Aplicadas:**
- `NVARCHAR` → `VARCHAR`
- `DATETIME2` → `TIMESTAMP`
- `BIT` → `BOOLEAN`
- `GETDATE()` → `now()`
- Removidos comandos `EXEC sp_addextendedproperty`

---

## 📝 CONCLUSÃO

**Status:** ✅ TODAS as migrations foram analisadas e corrigidas

**Dados Iniciais:** 
- ✅ 105+ registros distribuídos em 17 tabelas
- ✅ Todas as dependências mapeadas
- ✅ Ordem de execução validada

**Próximo Passo:**
1. Recriar banco de dados vazio
2. Executar aplicação Spring Boot
3. Flyway aplicará TODAS as migrations na ordem correta
4. Todos os dados de referência serão criados automaticamente

---

**Última Atualização:** 04/10/2025 18:40
**Responsável:** Claude (Análise Automática)
