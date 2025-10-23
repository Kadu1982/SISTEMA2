# Implementação do Módulo SAMU

## Visão Geral

Implementação completa do módulo SAMU (Serviço de Atendimento Móvel de Urgência) baseada no manual oficial IDS Saúde versão 5.17.16. O sistema gerencia todo o fluxo de atendimento de emergências médicas via 192.

## Fluxo de Trabalho

```
1. TARM (Solicitações do SAMU)
   ↓
2. Regulação Médica (Atendimentos de Solicitações)
   ↓
3. Solicitação de Ambulâncias
   ↓
4. Controle de Ambulâncias
   ↓
5. Histórico e Relatórios
```

## Estrutura de Arquivos

### Service Layer
- **`/services/samu/samuService.ts`** - Service completo com todas as operações SAMU

### Telas Implementadas
1. **`/pages/samu/Samu.tsx`** - Página principal com 7 abas
2. **`/pages/samu/SolicitacoesTARM.tsx`** - Recepção de chamadas 192
3. **`/pages/samu/AtendimentosSolicitacoes.tsx`** - Regulação médica
4. **`/pages/samu/SolicitacoesAmbulancia.tsx`** - Solicitação de ambulâncias
5. **`/pages/samu/HistoricoSolicitacoes.tsx`** - Histórico completo
6. **`/pages/samu/ControleViaturas.tsx`** - Controle de ambulâncias (existente)
7. **`/pages/samu/OcorrenciasAtivas.tsx`** - Ocorrências ativas (existente)
8. **`/pages/samu/EstatisticasSAMU.tsx`** - Relatórios (existente)

## Funcionalidades Principais

### 1. TARM - Solicitações do SAMU
**Arquivo**: `SolicitacoesTARM.tsx`

**Características**:
- Formulário dividido em 4 abas (Solicitação, Usuário, Ocorrência, Encaminhamento)
- Configuração dinâmica de campos via `ConfiguracaoSAMU`
- Busca de pacientes integrada
- Carregamento automático de endereço do paciente
- Validação com Zod schema
- Dashboard com estatísticas em tempo real

**Campos Configuráveis**:
- Tipo de Ocorrência (NAO / OBRIGATORIO / NAO_OBRIGATORIO)
- Tipo de Solicitante (NAO / OBRIGATORIO / NAO_OBRIGATORIO)
- Tipo de Ligação (NAO / OBRIGATORIO / NAO_OBRIGATORIO)
- Origem da Solicitação (NAO / OBRIGATORIO / NAO_OBRIGATORIO)

**Fluxo**:
1. Operador recebe chamada 192
2. Preenche dados da solicitação
3. Identifica paciente (opcional)
4. Registra local da ocorrência
5. Seleciona tipo de encaminhamento
6. Sistema gera código da solicitação

### 2. Regulação Médica
**Arquivo**: `AtendimentosSolicitacoes.tsx`

**Características**:
- Lista solicitações pendentes de regulação
- Calcula tempo de espera com código de cores
- Classificação de risco (Muito Risco / Médio Risco / Não Informado)
- Escala de dor 0-10 com indicador visual
- Decisão: Encerrar ou Encaminhar para ambulância

**Código de Cores Tempo de Espera**:
- Verde: < 15 minutos
- Amarelo: 15-30 minutos
- Vermelho: > 30 minutos

**Escala de Dor**:
- 0-4: Verde (leve)
- 5-7: Amarelo (moderada)
- 8-10: Vermelho (intensa)

**Fluxo**:
1. Médico regulador visualiza solicitações pendentes
2. Seleciona solicitação para regular
3. Avalia detalhamento da queixa
4. Classifica risco
5. Avalia dor (0-10)
6. Decide:
   - Encerra (orientação por telefone)
   - Encaminha (solicita ambulância)

### 3. Solicitação de Ambulâncias
**Arquivo**: `SolicitacoesAmbulancia.tsx`

**Características**:
- Lista ocorrências aguardando ambulância
- Seleção de tipo de ambulância com descrições
- Filtro de ambulâncias disponíveis por tipo
- Mudança automática de status para "Em espera"
- Formulário em 3 abas (Solicitação, Ambulância, Resumo)

**Tipos de Ambulâncias**:
- **USA** - Unidade de Suporte Avançado (UTI móvel)
- **USB** - Unidade de Suporte Básico
- **VT** - Veículo de Transporte (casos simples)
- **VIR** - Veículo de Intervenção Rápida
- **Motolância** - Motocicleta de resposta rápida
- **Ambulancha** - Ambulância fluvial
- **Helicóptero** - Transporte aéreo

**Fluxo**:
1. Operador visualiza ocorrências reguladas
2. Seleciona tipo de ambulância necessária
3. Escolhe ambulância disponível
4. Define profissional/especialidade (se necessário)
5. Define unidade de encaminhamento
6. Sistema aloca ambulância

### 4. Histórico de Solicitações
**Arquivo**: `HistoricoSolicitacoes.tsx`

**Características**:
- Filtros avançados (data, status, busca livre)
- Painel de estatísticas (total, finalizadas, em andamento, canceladas)
- Tabela paginada com todas as solicitações
- Visualização detalhada de cada solicitação
- Exportação para CSV
- Função de impressão

**Filtros Disponíveis**:
- Data início/fim
- Status da solicitação
- Busca por código, telefone, paciente ou queixa

**Status de Solicitação**:
- Pendente Regulação
- Em Regulação
- Regulada
- Ambulância Solicitada
- Em Atendimento
- Finalizada
- Cancelada

**Exportação**:
- Formato CSV com separador `;`
- Campos: Código, Data/Hora, Telefone, Solicitante, Queixa, Endereço, Status

## Service Layer

### Interfaces Principais

#### SolicitacaoSAMU
```typescript
interface SolicitacaoSAMU {
  // Identificação
  id?: number;
  codigo: number;

  // Chamada
  telefone: string;
  motivoQueixa?: string;
  tipoOcorrenciaId?: number;
  tipoSolicitanteId?: number;
  tipoLigacaoId?: number;
  origemSolicitacaoId?: number;
  estadoEmocional?: 'NORMAL' | 'ALTERADO';
  solicitante?: string;
  dataHora: string;

  // Usuário/Paciente
  usuarioId?: number;
  usuarioNome?: string;

  // Ocorrência
  municipio: string;
  logradouro: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  pontoReferencia?: string;
  latitude?: number;
  longitude?: number;

  // Encaminhamento
  tipoEncaminhamentoId?: number;
  profissionalEncaminhamentoId?: number;
  detalhamento?: string;
  classificacaoRisco?: string;
  avaliacaoDor?: number;
  tempoAtendimento?: string;

  // Metadata
  operadorRegistroId?: number;
  unidadeId?: number;
  status?: string;
}
```

#### AtendimentoSolicitacao
```typescript
interface AtendimentoSolicitacao {
  id?: number;
  solicitacaoId: number;
  profissionalId: number;
  detalhamento: string;
  classificacaoRisco: 'MUITO_RISCO' | 'MEDIO_RISCO' | 'NAO_INFORMADO';
  avaliacaoDor: number; // 0-10
  tipoEncaminhamentoId: number;
  profissionalEncaminhamentoId?: number;
  dataHoraInicio: string;
  dataHoraEncerramento?: string;
  tempoAtendimento?: string;
}
```

#### SolicitacaoAmbulancia
```typescript
interface SolicitacaoAmbulancia {
  id?: number;
  solicitacaoId: number;
  ambulanciaId: number;
  tipoAmbulanciaId: number;
  situacaoAmbulanciaId: number;
  profissionalId?: number;
  especialidadeId?: number;
  unidadeEncaminhamentoId?: number;
  procedimentoId?: number;
  dataHoraInicio: string;
  dataHoraEncerramento?: string;
  tempoAtendimento?: string;
}
```

### Endpoints do Service

#### Solicitações do SAMU (TARM)
```typescript
samuService.listarSolicitacoes(params?)
samuService.buscarSolicitacao(id)
samuService.criarSolicitacao(solicitacao)
samuService.atualizarSolicitacao(id, solicitacao)
```

#### Atendimentos de Solicitações (Regulação)
```typescript
samuService.listarSolicitacoesPendentesRegulacao(profissionalId?)
samuService.criarAtendimentoSolicitacao(atendimento)
samuService.encerrarAtendimentoSolicitacao(id)
```

#### Solicitações de Ambulâncias
```typescript
samuService.listarSolicitacoesAmbulancia(params?)
samuService.criarSolicitacaoAmbulancia(solicitacao)
samuService.encerrarSolicitacaoAmbulancia(id)
```

#### Controle de Ambulâncias
```typescript
samuService.listarAmbulanciasPorSituacao(situacaoId?)
samuService.atualizarSituacaoAmbulancia(ambulanciaId, situacaoId, detalhamento?)
```

#### Histórico
```typescript
samuService.buscarHistoricoSolicitacoes(filtros)
```

#### Cadastros (17 tipos)
```typescript
// Tipos de Ambulâncias
samuService.listarTiposAmbulancia()
samuService.criarTipoAmbulancia(tipo)
samuService.atualizarTipoAmbulancia(id, tipo)
samuService.deletarTipoAmbulancia(id)

// Ambulâncias
samuService.listarAmbulanciasTodas()
samuService.criarAmbulancia(ambulancia)
samuService.atualizarAmbulancia(id, ambulancia)
samuService.deletarAmbulancia(id)

// Situações de Ambulâncias
samuService.listarSituacoesAmbulancia()
samuService.criarSituacaoAmbulancia(situacao)
samuService.atualizarSituacaoAmbulancia(id, situacao)
samuService.deletarSituacaoAmbulancia(id)

// Equipes
samuService.listarEquipes()
samuService.criarEquipe(equipe)
samuService.atualizarEquipe(id, equipe)
samuService.deletarEquipe(id)

// Tipos de Solicitantes
samuService.listarTiposSolicitante()
samuService.criarTipoSolicitante(tipo)

// Tipos de Ligações
samuService.listarTiposLigacao()
samuService.criarTipoLigacao(tipo)

// Origens de Solicitações
samuService.listarOrigensSolicitacao()
samuService.criarOrigemSolicitacao(origem)

// Tipos de Encaminhamentos
samuService.listarTiposEncaminhamento()
samuService.criarTipoEncaminhamento(tipo)

// Tipos de Ocorrências
samuService.listarTiposOcorrencia()
samuService.criarTipoOcorrencia(tipo)

// Equipamentos
samuService.listarEquipamentos()
samuService.criarEquipamento(equipamento)
```

#### Configurações
```typescript
samuService.buscarConfiguracao(unidadeId)
samuService.salvarConfiguracao(config)
```

## Configuração do Módulo

### ConfiguracaoSAMU
```typescript
interface ConfiguracaoSAMU {
  id?: number;
  unidadeId: number;

  // Campos de Solicitação
  informarTipoOcorrencia: 'NAO' | 'OBRIGATORIO' | 'NAO_OBRIGATORIO';
  informarTipoSolicitante: 'NAO' | 'OBRIGATORIO' | 'NAO_OBRIGATORIO';
  informarTipoLigacao: 'NAO' | 'OBRIGATORIO' | 'NAO_OBRIGATORIO';
  tipoLigacaoPadrao?: number;
  informarOrigemSolicitacao: 'NAO' | 'OBRIGATORIO' | 'NAO_OBRIGATORIO';
  informarUsuarioSolicitacao: boolean;

  // Situações padrão
  situacaoAmbIniciarEtapa?: number;
  situacaoAmbEncerrarEtapa?: number;

  // Períodos dos Estágios (Dias)
  periodoSolicitacoesSamu: number;
  periodoAtendimentoSolicitacoes: number;
  periodoSolicitacoesAmbulancia: number;

  // Períodos de Recarga (Segundos)
  recargaSolicitacoesSamu: number;
  recargaAtendimentoSolicitacoes: number;
  recargaSolicitacoesAmbulancia: number;
}
```

## Validações e Regras de Negócio

### Validação de Solicitação (Zod)
```typescript
const solicitacaoSchema = z.object({
  telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  municipio: z.string().min(3, 'Município é obrigatório'),
  logradouro: z.string().min(5, 'Logradouro é obrigatório'),
  bairro: z.string().min(3, 'Bairro ou Distrito é obrigatório'),
  tipoEncaminhamentoId: z.number().min(1, 'Tipo de encaminhamento é obrigatório'),
});
```

### Regras de Exibição de Campos
```typescript
const deveMostrarCampo = (campo: string, config: ConfiguracaoSAMU | null): boolean => {
  if (!config) return true;
  const valor = config[campo as keyof ConfiguracaoSAMU];
  return valor !== 'NAO';
};

const campoObrigatorio = (campo: string, config: ConfiguracaoSAMU | null): boolean => {
  if (!config) return false;
  const valor = config[campo as keyof ConfiguracaoSAMU];
  return valor === 'OBRIGATORIO';
};
```

### Filtro de Tipos de Encaminhamento
```typescript
// Se Tipo de Ligação marca encerramento = true,
// só exibir Tipos de Encaminhamento com encerramento = true
const tiposEncaminhamentoFiltrados = tipoLigacaoSelecionado?.encerramento
  ? tiposEncaminhamento.filter(te => te.encerramento)
  : tiposEncaminhamento.filter(te => !te.encerramento);
```

## Padrões de Desenvolvimento

### Defensive API Response Handling
```typescript
const response = await samuService.listarSolicitacoes();
const data = response.data?.data || response.data;
```

### Padrão de Loading e Error Handling
```typescript
const [carregando, setCarregando] = useState(false);

try {
  setCarregando(true);
  const response = await samuService.criarSolicitacao(data);
  // sucesso
} catch (error) {
  console.error('Erro:', error);
  // tratar erro
} finally {
  setCarregando(false);
}
```

### Formatação de Data/Hora
```typescript
const formatarData = (dataHora?: string) => {
  if (!dataHora) return 'N/A';
  const data = new Date(dataHora);
  return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR');
};
```

## Componentes UI Utilizados

- **shadcn/ui**: Card, Button, Input, Label, Select, Dialog, Table, Tabs, Badge
- **lucide-react**: Ícones (Ambulance, Phone, MapPin, Clock, AlertCircle, etc.)
- **react-hook-form**: Gerenciamento de formulários
- **zod**: Validação de schemas

## Cadastros Necessários

Para funcionamento completo do módulo SAMU, são necessários os seguintes cadastros:

1. **Equipes do SAMU** - Composição: Médico, Enfermeiro, Motorista, Socorrista
2. **Tipos de Ambulâncias** - USA, USB, VT, VIR, Motolância, Ambulancha, Helicóptero
3. **Situações das Ambulâncias** - Com cores para identificação visual
4. **Tipos de Solicitantes**
5. **Tipos de Ligações** - Com flag de encerramento
6. **Origens das Solicitações**
7. **Tipos de Encaminhamentos** - Com flag de encerramento
8. **Apoios do SAMU**
9. **Tipos de Ocorrências**
10. **Equipamentos** - Recursos das ambulâncias
11. **Tipos de Equipamentos**
12. **Procedimentos**
13. **Especialidades**
14. **Profissionais**
15. **Unidades de Encaminhamento**
16. **Bases Operacionais**
17. **Centrais de Regulação**

## Próximos Passos

### Pendentes de Implementação

1. **Telas de Cadastros** - Criar interfaces para os 17 cadastros
2. **Tela de Configurações** - Interface para ConfiguracaoSAMU
3. **Aprimoramento do Controle de Ambulâncias**:
   - Painéis coloridos por situação
   - Mapa com localização em tempo real
   - Timeline de eventos da viatura

4. **Relatórios Específicos**:
   - Relatório de Atendimentos por Período
   - Relatório de Desempenho de Viaturas
   - Relatório de Tempo Médio de Resposta
   - Relatório de Ocorrências por Tipo
   - Relatório de Produtividade

5. **Integração BPA** - Boletim de Produção Ambulatorial

6. **Funcionalidades Avançadas**:
   - Geolocalização automática
   - Notificações em tempo real
   - Chat entre operadores/reguladores
   - Gravação de chamadas
   - Sistema de priorização automática

## Referências

- Manual IDS Saúde - Módulo SAMU versão 5.17.16
- Documentação oficial do SAMU 192
- Portarias do Ministério da Saúde sobre SAMU

## Notas Técnicas

### Performance
- Paginação implementada em todas as listagens
- Lazy loading de dados pesados
- Debounce em campos de busca

### Segurança
- Validação de dados no frontend e backend
- Controle de acesso por perfil
- Auditoria de todas as ações

### Acessibilidade
- Labels em todos os inputs
- Contraste adequado nas cores
- Navegação por teclado

### Responsividade
- Grid adaptativo (md:grid-cols-2, md:grid-cols-4)
- Tabelas com scroll horizontal em mobile
- Dialogs com max-height para mobile
