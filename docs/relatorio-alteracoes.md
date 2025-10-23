# Relatório de Alterações (Antes/Depois)

Data/Hora: 2025-08-12 15:16

Objetivo: Implementar correções prioritárias apontadas em docs/relatorio-erros.md, mantendo o sistema funcionando como já está. Este documento descreve as mudanças propostas com o estado “Antes” e o resultado esperado “Depois”.

---

## 1) Tipos — PacienteList inexistente

- Arquivo: frontend\src\types\paciente\Paciente.ts
- Antes:
  - O tipo `PacienteList` é importado e utilizado em componentes da UPA, mas não existe nas definições de tipos. Há duas definições de `Paciente` em caminhos diferentes.
- Depois (alteração aplicada):
  - Adicionado `export interface PacienteList` contendo os campos necessários usados na UPA (`id`, `nomeCompleto`, `cpf?`, `cns?`, etc.).
  - Nenhuma importação foi alterada; apenas passará a compilar corretamente onde `PacienteList` é usado.
- Impacto esperado:
  - Elimina erro de compilação de TypeScript por tipo inexistente, sem alterar comportamento em tempo de execução.

## 2) Importações com extensão .ts/.tsx

- Arquivos:
  - frontend\src\components\upa\UpaForm.tsx
  - frontend\src\services\upaService.ts
  - frontend\src\routes\routes.tsx
- Antes:
  - Importações internas usando alias com extensões explícitas `.ts`/`.tsx`, o que pode causar problemas de resolução em alguns ambientes.
- Depois (alteração aplicada):
  - Removidas extensões nas importações internas (ex.: `@/types/upa` em vez de `@/types/upa.ts`).
- Impacto esperado:
  - Maior compatibilidade entre ambientes e ferramentas; nenhum impacto funcional.

## 3) React.lazy sem Suspense

- Arquivo: frontend\src\App.tsx
- Antes:
  - Rotas carregadas via `React.lazy` sem um ancestral `<Suspense>`, risco de runtime error ao navegar.
- Depois (alteração aplicada):
  - Envolvido `<AppRoutes />` com `<React.Suspense fallback={<div>Carregando...</div>}>`.
- Impacto esperado:
  - Evita erro de "component suspended without fallback"; apresenta um fallback simples durante carregamento dos módulos.

## 4) Formatação de datetime-local (UTC vs Local)

- Arquivo: frontend\src\components\upa\UpaForm.tsx
- Antes:
  - Valor padrão do campo `datetime-local` gerado com `new Date().toISOString().slice(0,16)` (UTC), exibindo horários deslocados para o usuário.
- Depois (alteração aplicada):
  - Valor padrão formatado em horário local no formato `yyyy-MM-ddTHH:mm` usando Date APIs nativas.
- Impacto esperado:
  - Exibição consistente no fuso do usuário e envio de dados coerentes para o backend.

## 5) Lógicas simuladas e toasts (não alterado agora)

- Arquivos: frontend\src\components\upa\TriagemUPA.tsx, AtendimentoUPA.tsx
- Antes:
  - Status/prioridade simulados (Math.random) e uso de alert/confirm nativos em alguns fluxos.
- Depois (somente documentação nesta etapa):
  - Mantidos como estão para não alterar comportamento operacional até que endpoints de backend estejam disponíveis para status real e que possamos padronizar feedback de UI via toasts/modais.
- Impacto esperado:
  - Sem mudança funcional nesta etapa. Planejada integração futura.

---

## Testes e Validação

- Frontend será verificado com build/type-check após as alterações. Ajustes adicionais serão feitos se surgirem erros.

## Itens Pendentes para Próxima Etapa (exigem coordenação/backend)

- Alinhar DTOs do backend (ex.: tipos de IDs numéricos em vez de String em AtendimentoDTO) e garantir envelope `{ success, message, data }` em todas as rotas usadas pelo frontend.
- Substituir lógicas simuladas por integração real de status/fluxo de UPA.
- Padronizar notificações para substituir `alert/confirm` por componentes do design system.
- Unificar a definição de `Paciente` (eliminar duplicidade de arquivos) de forma incremental para não quebrar importações atuais.
