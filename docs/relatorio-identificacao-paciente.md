# Relatório de Alteração: Identificação de Paciente (ID -> ID Nome)

Data/Hora: 2025-08-12 15:33

Objetivo: Onde o sistema exibia apenas o identificador numérico do paciente, passar a exibir o padrão "ID - Nome" e possibilitar busca também pelo nome, sem alterar fluxos existentes.

Alterações aplicadas:
- Criado componente reutilizável `frontend/src/components/common/PacienteIdNome.tsx` que recebe `id` e renderiza `"ID - Nome"`, buscando o nome via `getPacienteById` e mantendo cache em memória por sessão. Também exporta `getCachedPacienteNome(id)` para consultas rápidas ao nome já carregado.
- Atualizados os componentes da UPA para usar esse componente:
  - `NovaOcorrenciaUPA.tsx`: substituído texto fixo por `<PacienteIdNome id={upa.pacienteId} prefixo="Paciente" />`.
  - `TriagemUPA.tsx`: idem e filtro ajustado para considerar o nome em `getCachedPacienteNome` (placeholder atualizado: "Buscar por ID, nome ou observações...").
  - `AtendimentoUPA.tsx`: idem e filtro ajustado para considerar o nome em `getCachedPacienteNome` (placeholder atualizado: "Buscar por ID, nome ou observações...").

Impacto:
- Experiência do usuário melhorada com identificação clara do paciente.
- Filtro agora atende buscas por nome assim que os nomes forem carregados em cache (primeira visualização pode levar alguns instantes para preencher o cache; optamos por uma abordagem mínima sem alterar o contrato do endpoint de UPA).

Próximos passos sugeridos (opcional):
- Incluir `pacienteNome` diretamente no DTO de UPA retornado pelo backend para evitar chamadas adicionais por item e permitir busca por nome imediatamente.
- Aplicar o mesmo padrão em outros módulos que exibam apenas ID numérico de paciente.
