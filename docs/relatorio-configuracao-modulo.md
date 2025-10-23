# Relatório de Ajuste: Módulo "Configuração" vs Package "config"

Data/Hora: 2025-08-12 15:33

Contexto: Havia confusão entre o módulo de "Configuração" do sistema (acessado via interface) e o package/base de "config" (configurações técnicas). O objetivo é deixar claro que:
- Módulo: "Configuração" é uma área funcional da aplicação voltada à administração/ajustes via UI.
- Package/Config: permanece sendo o conjunto de configurações técnicas do sistema (ex.: variáveis, proxies, etc.).

Alterações aplicadas (Antes/Depois):
- Antes: O menu exibia o item "Configuração do Sistema" apontando para a rota /configuracoes.
- Depois: O menu passa a exibir o item "Configuração" (módulo) mantendo a mesma rota e página (SystemConfig). Nenhuma alteração foi feita nos pacotes técnicos de configuração do projeto.

Impacto:
- UX mais alinhada ao domínio: o módulo aparece claramente como "Configuração".
- Sem mudanças de rota/back-end, evitando regressões.

Próximos passos sugeridos (opcional):
- Se desejarem separar ainda mais conceitos, podemos introduzir uma página introdutória do módulo "Configuração" com links para subseções (parâmetros, perfis, integrações) sem alterar a página SystemConfig atual.
