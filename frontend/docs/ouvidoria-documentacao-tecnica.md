# Documentação Técnica - Módulo de Ouvidoria SUS

## Visão Geral

O Módulo de Ouvidoria SUS é uma solução completa para gestão de manifestações cidadãs no Sistema Único de Saúde, desenvolvido com React/TypeScript, integrado ao sistema de saúde municipal e em conformidade com a LGPD.

## Arquitetura do Sistema

### Stack Tecnológica

- **Frontend**: React 18 + TypeScript
- **Framework UI**: Shadcn/UI + Tailwind CSS
- **Roteamento**: React Router DOM
- **Gerenciamento de Estado**: Context API + useState/useEffect
- **Validação**: Formulários controlados com validação inline
- **Notificações**: Sistema de toast integrado
- **Icons**: Lucide React

### Estrutura de Diretórios

```
src/
├── components/
│   └── ouvidoria/
│       ├── CidadaoManifestacao.tsx       # Interface cidadão
│       ├── OuvidorDashboard.tsx          # Dashboard ouvidor
│       ├── GestaoManifestacoes.tsx       # Gestão de manifestações
│       ├── RelatoriosOuvidoria.tsx       # Relatórios gerenciais
│       ├── PesquisaSatisfacao.tsx        # Pesquisas de satisfação
│       └── ConfiguracoesOuvidoria.tsx    # Configurações sistema
├── pages/
│   └── Ouvidoria.tsx                     # Página principal
└── services/
    └── baseCadastro.ts                   # Serviços integrados
```

## Componentes Principais

### 1. CidadaoManifestacao.tsx

**Responsabilidade**: Interface para criação de manifestações pelos cidadãos

**Props**: Nenhuma (componente autocontido)

**Estado Principal**:

```typescript
interface DadosManifestacao {
  tipo: string; // Tipo da manifestação
  categoria: string; // Categoria do problema
  descricao: string; // Descrição detalhada
  unidadeRelacionada: string; // Unidade de saúde (opcional)
  pacienteSelecionado: any; // Paciente identificado (opcional)
  aceitaTermos: boolean; // Consentimento LGPD
  anexos: File[]; // Arquivos anexados
}
```

**Funcionalidades**:

- ✅ Fluxo wizard em 4 etapas com validação
- ✅ Seleção de tipo de manifestação (reclamação, sugestão, elogio, denúncia, informação)
- ✅ Upload de anexos com validação (JPG, PNG, PDF, TXT, máx 5MB)
- ✅ Busca e seleção de pacientes cadastrados
- ✅ Integração com unidades de saúde
- ✅ Geração automática de protocolo
- ✅ Conformidade LGPD com consentimento explícito

**Interface Visual**:

- Design moderno com gradientes e cards
- Barra de progresso visual
- Validação em tempo real
- Responsivo para mobile/desktop
- Feedback visual para ações do usuário

### 2. Ouvidoria.tsx

**Responsabilidade**: Página principal com controle de acesso por perfil

**Funcionalidades**:

- ✅ Detecção automática de perfil (cidadão vs ouvidor)
- ✅ Interface diferenciada por permissão
- ✅ Sistema de tabs adaptativo
- ✅ Controle de acesso baseado em roles

**Perfis de Acesso**:

```typescript
// Cidadão - Interface simplificada
- Nova Manifestação
- Acompanhar Protocolo

// Ouvidor/Admin - Interface completa
- Dashboard Analítico
- Gestão de Manifestações
- Relatórios Gerenciais
- Pesquisas de Satisfação
- Configurações do Sistema
```

### 3. Integração com Sistema Base

**BaseCadastroService**:

```typescript
// Métodos utilizados pela Ouvidoria
buscarTodasUnidades(): UnidadeSaude[]     // Lista unidades ativas
buscarPaciente(id: string): Paciente      // Busca paciente por ID
buscarPacientePorCpf(cpf: string)        // Busca por CPF
buscarPacientePorCartaoSus(sus: string)   // Busca por Cartão SUS
```

## Fluxos de Processo

### Fluxo Principal - Cidadão

1. **Acesso**: Página /ouvidoria (sem necessidade de login)
2. **Seleção**: Tipo de manifestação com descrições claras
3. **Detalhamento**: Categoria, descrição, unidade relacionada
4. **Identificação**: Opcional, com busca de pacientes
5. **Finalização**: Anexos, revisão e consentimento LGPD
6. **Confirmação**: Geração de protocolo e notificação

### Fluxo Secundário - Ouvidor

1. **Login**: Autenticação com controle de permissão
2. **Dashboard**: Visão analítica das manifestações
3. **Gestão**: Tramitação, resposta, acompanhamento
4. **Relatórios**: Geração de análises gerenciais
5. **Configuração**: Ajustes do sistema

## Segurança e Compliance

### LGPD (Lei Geral de Proteção de Dados)

- ✅ Consentimento explícito e informado
- ✅ Finalidade específica para tratamento de dados
- ✅ Identificação opcional para manifestações
- ✅ Direitos do titular claramente informados
- ✅ Base legal: execução de políticas públicas

### Segurança Técnica

- ✅ Validação de entrada de dados
- ✅ Sanitização de arquivos upload
- ✅ Controle de acesso baseado em roles
- ✅ Logs de auditoria (via console.log)
- ✅ Validação de tipos de arquivo

### Acessibilidade

- ✅ Interface responsiva (mobile-first)
- ✅ Cores com contraste adequado
- ✅ Navegação por teclado
- ✅ Textos descritivos e labels claros
- ✅ Compatível com leitores de tela

## Configurações e Personalização

### Tipos de Manifestação (Configurável)

```typescript
const tiposManifestacao = [
  {
    id: "reclamacao",
    nome: "Reclamação",
    cor: "bg-red-500",
    icon: "⚠️",
    descricao: "Insatisfação com serviços",
  },
  // ... outros tipos
];
```

### Categorias (Configurável)

```typescript
const categorias = [
  "Atendimento Médico",
  "Atendimento de Enfermagem",
  "Infraestrutura da Unidade",
  // ... outras categorias
];
```

## APIs e Integrações

### Endpoints Utilizados (Frontend)

- **GET** `/unidades` - Lista unidades de saúde
- **GET** `/pacientes/buscar` - Busca pacientes
- **POST** `/manifestacoes` - Cria nova manifestação

### Integrações Externas Previstas

- **Sistema de Email**: Notificações automáticas
- **Sistema de SMS**: Alertas por celular
- **CNES**: Validação de unidades
- **CNS**: Validação de profissionais
- **Sistema Municipal**: Dados de pacientes

## Métricas e Monitoramento

### KPIs Implementados

- ✅ Contagem de manifestações por tipo
- ✅ Taxa de conclusão do fluxo
- ✅ Distribuição por unidade de saúde
- ✅ Tempo médio de preenchimento

### Logs de Auditoria

```typescript
// Exemplo de log de manifestação
{
  protocolo: "OUV12345678",
  tipo: "reclamacao",
  categoria: "Atendimento Médico",
  dataRegistro: new Date(),
  status: "RECEBIDA",
  pacienteId: "opcional",
  unidadeId: "opcional",
  anexos: ["arquivo1.pdf"],
  lgpdConsent: true
}
```

## Testes e Qualidade

### Estratégia de Testes

- **Unitários**: Validação de funções e estados
- **Integração**: Fluxo completo de manifestação
- **E2E**: Jornada do usuário completa
- **Acessibilidade**: WCAG 2.1 AA compliance

### Validações Implementadas

- ✅ Campos obrigatórios por etapa
- ✅ Tipos de arquivo permitidos
- ✅ Tamanho máximo de arquivos (5MB)
- ✅ Consentimento LGPD obrigatório
- ✅ Integração com dados existentes

## Performance e Otimização

### Otimizações Implementadas

- ✅ Lazy loading de componentes
- ✅ Debounce em buscas de pacientes
- ✅ Validação assíncrona
- ✅ Componentização modular
- ✅ Bundle splitting automático

### Responsividade

- ✅ Mobile-first design
- ✅ Breakpoints: sm (640px), md (768px), lg (1024px)
- ✅ Grid adaptativo
- ✅ Componentes flexíveis

## Manutenção e Evolução

### Estrutura Modular

- ✅ Componentes reutilizáveis
- ✅ Hooks customizados para lógica
- ✅ Serviços separados por responsabilidade
- ✅ Tipagem forte TypeScript

### Pontos de Extensão

- **Novos tipos de manifestação**: Configuração em array
- **Categorias personalizadas**: Lista configurável
- **Validações específicas**: Hooks customizáveis
- **Integrações externas**: Service layer preparado

## Deployment e Infraestrutura

### Requisitos Mínimos

- **Node.js**: 18+
- **Navegadores**: Chrome 90+, Firefox 88+, Safari 14+
- **Resolução**: 320px (mobile) a 1920px (desktop)

### Variáveis de Ambiente

```bash
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_ENV=production
REACT_APP_VERSION=1.0.0
```

### Build de Produção

```bash
npm run build
# Gera pasta dist/ otimizada para produção
# Assets minificados e comprimidos
# Source maps para debugging
```

## Próximos Passos

### Funcionalidades Futuras

- [ ] Módulo de tramitação interna
- [ ] Dashboard analítico avançado
- [ ] Relatórios automáticos
- [ ] Integração com sistemas externos
- [ ] API de pesquisa de satisfação
- [ ] Módulo de configurações avançadas

### Melhorias Técnicas

- [ ] Implementação de cache
- [ ] Otimização de bundles
- [ ] Testes automatizados completos
- [ ] Documentação de API
- [ ] Monitoramento de performance

---

**Versão**: 1.0.0  
**Última Atualização**: 2025-01-26  
**Responsável**: Equipe de Desenvolvimento SUS  
**Status**: Funcional e em Produção
