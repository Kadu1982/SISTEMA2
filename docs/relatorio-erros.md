# Relatório de Erros e Inconsistências do Projeto

Data/Hora da análise: 2025-08-11 16:33

Este relatório compila problemas identificados no repositório D:\IntelliJ\sistema2 (frontend React/TypeScript + backend Spring Boot). Foram considerados erros prováveis de compilação/execução, inconsistências entre camadas e más práticas que podem causar bugs.

Observação: A etapa de build geral retornou sucesso no ambiente desta análise, mas nem todos os alvos (por exemplo, typecheck completo do TypeScript e execução do app) são garantidos por esse resultado. Os pontos abaixo devem ser revisados e corrigidos.

---

## 1) Frontend (React/TypeScript)

1.1. Duplicidade e divergência de tipos de Paciente
- Arquivos:
  - frontend\src\types\Paciente.ts
  - frontend\src\types\paciente\Paciente.ts
- Problema:
  - Há dois arquivos distintos definindo a interface Paciente em caminhos diferentes (com e sem subpasta paciente). Isso gera risco de importações inconsistentes e divergência de tipos ao longo do código. Já há sinais de importações para ambos os caminhos em componentes diferentes.
- Risco/Impacto: Erros de tipo e comportamento inconsistente; dificuldade de manutenção.
- Ação recomendada: Consolidar em um único arquivo/fonte de verdade e refatorar importações para um caminho único.

1.2. Uso de tipo inexistente PacienteList
- Arquivos:
  - frontend\src\components\upa\NovaOcorrenciaUPA.tsx (linha ~58, assinatura onClose)
  - frontend\src\components\upa\UpaForm.tsx (linhas 3, 11, 15, 23, 65)
- Problema:
  - Os componentes importam e utilizam PacienteList a partir de '@/types/paciente/Paciente' (ou '@/types/paciente/Paciente.ts'), porém esse tipo não está definido em nenhum dos arquivos de tipos. Apenas existe a interface Paciente.
- Risco/Impacto: Erro de compilação do TypeScript e/ou em tempo de execução se suprimido por qualquer configuração.
- Ação recomendada: Criar o tipo PacienteList (ou ajustar os componentes para usar o tipo Paciente existente), garantindo que os campos referenciados (id, nomeCompleto, cpf, cns etc.) existam no tipo.

1.3. Importações com extensão explícita .ts/.tsx nos aliases
- Arquivos (exemplos):
  - frontend\src\components\upa\UpaForm.tsx: importa '@/types/upa.ts', '@/types/paciente/Paciente.ts', '@/services/upaService.ts', '@/components/ui/button.tsx', '@/components/upa/PacienteAutocomplete.tsx'
  - frontend\src\services\upaService.ts: importa '@/services/apiService.ts'
  - frontend\src\components\agendamento\AgendarConsulta.tsx: múltiplas importações com .ts
- Problema:
  - Em projetos Vite/TS com path alias, o padrão é importar sem extensão (ex.: '@/types/upa'). A extensão explícita pode causar problemas de resolução de módulo em alguns ambientes, bundlers ou ferramentas de análise.
- Risco/Impacto: Falhas de build ou inconsistência entre ambientes (ex.: testes vs dev).
- Ação recomendada: Padronizar importações removendo as extensões .ts/.tsx de módulos internos.

1.4. React.lazy sem Suspense
- Arquivos:
  - frontend\src\routes\routes.tsx (múltiplos lazy imports)
  - frontend\src\App.tsx não envolve <AppRoutes /> com <Suspense fallback={...}>
- Problema:
  - Componentes carregados com React.lazy exigem um <Suspense> ancestral com fallback. Sem isso, ao montar uma rota lazy pode ocorrer erro: "A component suspended while rendering, but no fallback UI was specified".
- Risco/Impacto: Erro em tempo de execução ao navegar para rotas lazy.
- Ação recomendada: Envolver <AppRoutes /> (ou o trecho onde lazy é usado) com <React.Suspense fallback={<Spinner/>}>.

1.5. Formatação de data/hora para input datetime-local
- Arquivo:
  - frontend\src\components\upa\UpaForm.tsx (linhas 16–19)
- Problema:
  - Usa new Date().toISOString().slice(0, 16), que gera data/hora em UTC. O input type="datetime-local" espera valor no horário local sem timezone. Isso pode exibir horários deslocados (adiantados/atrasados) conforme fuso.
- Risco/Impacto: Inconsistência de horário exibido e enviado ao backend.
- Ação recomendada: Gerar string local no formato yyyy-MM-ddTHH:mm baseada em fuso local (ex.: usando Intl.DateTimeFormat ou manualmente com getFullYear, getMonth+1, etc.).

1.6. Uso de confirm/alert diretos nos componentes
- Arquivos:
  - frontend\src\components\upa\NovaOcorrenciaUPA.tsx (confirm/alert)
  - frontend\src\components\upa\TriagemUPA.tsx, AtendimentoUPA.tsx (usar alert em erros)
- Problema:
  - UI/UX e testabilidade comprometidas; ausência de padrão de notificação (o projeto já tem Toaster/Toast em outros locais).
- Risco/Impacto: Experiência inconsistente e difícil automação de testes.
- Ação recomendada: Centralizar feedbacks em um sistema de toasts/modais do design system do projeto.

1.7. Lógica simulada de status/prioridade em telas críticas
- Arquivos:
  - frontend\src\components\upa\TriagemUPA.tsx (getStatusTriagem retorna aleatório)
  - frontend\src\components\upa\AtendimentoUPA.tsx (getStatusAtendimento usa Math.random; prioridade baseada só no tempo)
- Problema:
  - Lógica placeholder pode induzir a decisões incorretas no fluxo real, se acabar em produção.
- Risco/Impacto: Exibição incorreta de status/prioridade; confusão operacional.
- Ação recomendada: Integrar com backend para status/fluxo reais, removendo simulações.

1.8. Rota Recepção importada com extensão e caminho possivelmente não padronizado
- Arquivo:
  - frontend\src\routes\routes.tsx: lazy(() => import("@/pages/recepcao/Recepcao.tsx"))
- Problema:
  - Mesmo ponto do item 1.3; além disso, padronizar importações sem extensão melhora manutenção.
- Ação recomendada: Trocar para import("@/pages/recepcao/Recepcao").

1.9. Inconsistência de campos entre frontend e backend para Paciente
- Observação:
  - Frontend Paciente inclui campos de auditoria (dataCriacao, criadoPor, atualizadoPor, ativo) e outros; no backend Paciente.java não há esses campos (exceto dataAtualizacao), mas o TS marca-os como opcionais.
- Risco/Impacto: Embora opcionais no TS, pode haver expectativa de exibição/edição desses dados no frontend que o backend não fornece.
- Ação recomendada: Alinhar contrato (DTOs) para refletir exatamente os campos suportados pelo backend, ou implementar os campos no backend caso sejam necessários.

1.10. Arquivo de tipos duplicado pode causar imports conflitantes
- Exemplos:
  - frontend\src\components\agendamento\AgendarConsulta.tsx importa '@/types/Paciente.ts', enquanto outros arquivos usam '@/types/paciente/Paciente'.
- Risco/Impacto: Quebra ao mover/renomear; confusão de equipe; inconsistências sutis de tipo.
- Ação recomendada: Unificar caminho e limpar duplicatas.

1.11. Tratamento de erro com any
- Arquivos (exemplos):
  - frontend\src\services\upaService.ts (catch error: any)
  - frontend\src\pages\pacientes\NovoPacientePage.tsx (error: any)
- Problema:
  - Uso extensivo de any limita segurança de tipos.
- Ação recomendada: Tipar erros de Axios (AxiosError) e respostas de erro com interseção ou tipos utilitários.

1.12. Falta de checagem de null/undefined em campos opcionais
- Exemplos:
  - Em diversas concatenações/uso de valores opcionais (ex.: filtragem por upa.observacoes) há checagens, mas manter consistência em todos os locais evita exceções.

---

## 2) Backend (Spring Boot)

2.1. Divergência de campos entre entidade Paciente e tipos do frontend
- Arquivo:
  - backend\src\main\java\com\sistemadesaude\backend\paciente\entity\Paciente.java
- Problema:
  - Ausência de campos de auditoria (dataCriacao, criadoPor, atualizadoPor, ativo) e outros que aparecem no frontend como opcionais. Existe dataAtualizacao e dataUltimaMenstruacao. Se o frontend tentar consumir/exibir esses campos, virão null/ausentes.
- Risco/Impacto: Inconsistências em telas que esperem esses dados.
- Ação recomendada: Definir DTOs alinhados ao frontend ou implementar auditoria na entidade/DB (CreationTimestamp, campos de usuário, etc.).

2.2. Validações mínimas de CPF/CNS apenas por tamanho
- Arquivo:
  - Paciente.java: temCpfValido checa apenas tamanho 11; cns limitado por length na coluna mas sem validação formal.
- Problema:
  - Regras brasileiras exigem validação de dígito verificador para CPF e regras específicas para CNS.
- Risco/Impacto: Dados inválidos persistidos.
- Ação recomendada: Implementar validador de CPF/CNS no backend (e preferencialmente também no frontend) e/ou usar Bean Validation custom.

2.3. Endereço como VO com validações, mas sem integração nas operações de persistência
- Arquivos:
  - Paciente.java usa métodos @Transient getEndereco/setEndereco com VO Endereco.
- Observação:
  - Sem DTOs claros, pode haver confusão na API quanto ao formato de entrada/saída do endereço (normalizado vs desnormalizado). Documentar/alinhar com o frontend.

2.4. DTO de Atendimento com id String e campos principais como String
- Arquivo:
  - backend\src\main\java\com\sistemadesaude\backend\atendimento\dto\AtendimentoDTO.java
- Problema:
  - id e pacienteId definidos como String (e @NotBlank), enquanto em vários pontos do frontend IDs são number. Isso cria fricção de conversão.
- Risco/Impacto: Erros de (de)serialização e mapeamento.
- Ação recomendada: Alinhar tipos (usar Long/UUID conforme o domínio) e ajustar validações (@NotNull para numéricos).

2.5. Cobertura de testes e validações de domínio
- Observação geral: Não há evidências nesta análise de testes automatizados associados aos módulos alterados (ex.: SAMU/UPA). Recomenda-se adicionar testes de serviço/controlador para as novas rotas e enums (PrioridadeOcorrencia, TipoOcorrencia) e para as regras de negócio novas.

---

## 3) Integração Frontend/Backend

3.1. Contrato de API para UPA
- Arquivos:
  - frontend\src\services\upaService.ts usa baseURL '/api' com Vite proxy configurado (ok) e assume um envelope ApiResponse<T> { success, message, data }.
- Problema:
  - É necessário garantir que o backend realmente responda com esse envelope em todas as rotas /upa (GET/POST/PUT/DELETE). Caso contrário, haverá runtime errors ao acessar response.data.success.
- Ação recomendada: Verificar controladores do backend UPA e padronizar envelope de resposta ou ajustar o cliente.

3.2. Formato de data/hora
- Problema:
  - Frontend usa strings ISO (com ou sem 'T') e faz normalização ad hoc para incluir 'T00:00:00'. Backend deve documentar o formato aceito (ex.: ISO-8601) e timezone esperado.
- Ação recomendada: Centralizar utilitários de formatação de data e documentar contrato na API.

3.3. Status e fluxo de triagem/atendimento
- Problema:
  - Frontend simula estados; backend precisa expor endpoints para obter status real e atualizar fluxo (triagem realizada, em atendimento, concluído etc.).

---

## 4) Qualidade do Código e Boas Práticas

4.1. Logging ruidoso em produção
- Vários arquivos do frontend usam console.log/console.error com muitos detalhes. Em produção, isso deve ser filtrado/removido ou controlado por flag de ambiente.

4.2. Padronização de nomenclatura e pastas
- Duplicidade de pastas/types e caminhos inconsistentes aumentam a chance de erro. Padronizar convenções (kebab-case vs PascalCase em nomes de arquivos TS) e estrutura de pastas.

4.3. Tipagem de serviços e erros
- Tipar respostas de Axios e erros (AxiosError) e evitar any melhora DX e robustez.

4.4. Acessibilidade e UX
- Uso de alert/confirm nativos, ausência de feedback consistente em ações assíncronas em alguns fluxos. Preferir componentes do design system com estados de carregamento, confirmação e erro.

---

## 5) Resumo das Ações Prioritárias

P1. Unificar os tipos de Paciente (remover duplicata; corrigir todas as importações) e definir/criar o tipo PacienteList ou trocar para Paciente.  
P2. Adicionar React.Suspense com fallback envolvendo as rotas lazy para evitar erro em runtime.  
P3. Padronizar importações internas removendo extensões .ts/.tsx nos paths com alias.  
P4. Corrigir formatação do valor de datetime-local para horário local no UpaForm.  
P5. Remover lógicas simuladas (Math.random) e integrar com backend para status/prioridade.  
P6. Revisar contrato da API /upa para garantir o envelope { success, message, data }.  
P7. Alinhar DTOs de backend (tipos de IDs numéricos x string; validações @NotNull/@NotBlank adequadas).  
P8. Implementar validações robustas de CPF/CNS no backend (e idealmente no frontend).  
P9. Padronizar tratamento de erros com toasts/modais e reduzir logs verbosos em produção.  

---

## 6) Itens Observados Mas Não Críticos Agora

- Backend Paciente não possui campo dataCriacao/criadoPor/atualizadoPor/ativo; como o frontend marca como opcionais, não é bug imediato, mas alinhar expectativas evita dúvidas futuras.
- Endereço como VO está coerente, mas documentar payload esperado em DTOs para manter consistência com frontend.

---

Caso deseje, posso proceder com correções prioritárias (ex.: adicionar Suspense, criar tipo PacienteList, padronizar importações) via PR incremental.
