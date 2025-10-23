# Guia: Como Rodar e Testar o Sistema Cidade Saúde Digital

Este guia fornece instruções detalhadas sobre como executar e testar o sistema Cidade Saúde Digital através da interface frontend.

## 1. Configuração do Ambiente

### Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Docker e Docker Compose** (para o método recomendado)
- **Node.js** (versão 18 ou superior)
- **Java 17** (para execução manual do backend)
- **Maven** (para execução manual do backend)
- **Git** (para clonar o repositório, se necessário)

### Configuração de Variáveis de Ambiente

1. Crie um arquivo `.env` na raiz do projeto baseado no arquivo `.env.example`
2. Configure as variáveis necessárias, especialmente:
   - Credenciais do banco de dados
   - Chave secreta JWT
   - URLs de serviços externos (se aplicável)

## 2. Executando o Sistema

### Método 1: Usando Docker (Recomendado)

Este método executa tanto o backend quanto o frontend em contêineres Docker:

1. Abra um terminal na raiz do projeto
2. Execute o comando:
   ```bash
   docker-compose up --build
   ```
3. Aguarde até que todos os serviços estejam em execução
4. O sistema estará disponível em:
   - **Frontend**: http://localhost:5173
   - **Backend**: http://localhost:5011
   - **Banco de dados PostgreSQL**: porta 5432

### Método 2: Execução Manual (Modo Desenvolvedor)

#### Backend (Spring Boot)

1. Abra um terminal na raiz do projeto
2. Navegue até a pasta do backend:
   ```bash
   cd backend
   ```
3. Execute o aplicativo Spring Boot:
   ```bash
   ./mvnw spring-boot:run
   ```
   (No Windows, use `mvnw.cmd` em vez de `./mvnw`)
4. O backend estará disponível em http://localhost:5011

#### Frontend (Vite/React)

1. Abra outro terminal na raiz do projeto
2. Navegue até a pasta do frontend:
   ```bash
   cd frontend
   ```
3. Instale as dependências (apenas na primeira vez ou quando houver alterações no package.json):
   ```bash
   npm install
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
5. O frontend estará disponível em http://localhost:5173

## 3. Acessando o Sistema

1. Abra seu navegador e acesse http://localhost:5173
2. Você será direcionado para a página inicial do sistema

### Autenticação

Para acessar as funcionalidades do sistema, você precisará fazer login:

1. Clique no botão "Login" ou acesse diretamente a página de login
2. Existem dois métodos de login:
   - **Login de Operador**: Para profissionais de saúde e administradores
   - **Login Biométrico**: Se configurado, para acesso rápido de profissionais

#### Credenciais de Teste

Para fins de teste, você pode usar as seguintes credenciais (se configuradas no sistema):

- **Administrador**:
  - Login: admin
  - Senha: senha_admin

- **Recepção**:
  - Login: recepcao
  - Senha: senha_recepcao

- **Médico**:
  - Login: medico
  - Senha: senha_medico

**Nota**: Se estas credenciais não funcionarem, verifique com o administrador do sistema quais são as credenciais válidas para teste.

## 4. Navegando pelo Sistema

O sistema Cidade Saúde Digital é organizado em vários módulos, cada um com funcionalidades específicas:

### Módulos Principais

- **Dashboard**: Visão geral do sistema com métricas e indicadores
- **Agendamento**: Marcação de consultas e exames
- **Atendimento**: Registro de atendimentos médicos
- **Cadastro**: Cadastro de pacientes e profissionais
- **Farmácia**: Gestão de medicamentos e dispensação
- **Exames**: Solicitação e resultados de exames
- **Triagem**: Classificação de risco e sinais vitais
- **Faturamento**: Gestão financeira e faturamento SUS
- **Ouvidoria**: Gestão de manifestações dos cidadãos

### Fluxos de Teste Comuns

#### 1. Cadastro de Paciente

1. Acesse o módulo "Cadastro"
2. Clique em "Novo Paciente"
3. Preencha os dados do paciente (nome, CPF, data de nascimento, etc.)
4. Salve o cadastro
5. Verifique se o paciente aparece na lista de pacientes

#### 2. Agendamento de Consulta

1. Acesse o módulo "Agendamento"
2. Selecione "Nova Consulta"
3. Busque o paciente cadastrado
4. Selecione a especialidade médica
5. Escolha a data e horário disponíveis
6. Confirme o agendamento
7. Verifique se a consulta aparece na agenda

#### 3. Registro de Atendimento

1. Acesse o módulo "Atendimento"
2. Busque o paciente com consulta agendada
3. Inicie o atendimento
4. Registre os dados do atendimento (anamnese, diagnóstico, etc.)
5. Finalize o atendimento
6. Verifique se o atendimento foi registrado no histórico do paciente

#### 4. Ouvidoria (Manifestação Cidadã)

1. Acesse o módulo "Ouvidoria"
2. Selecione "Nova Manifestação"
3. Escolha o tipo de manifestação (reclamação, sugestão, elogio, etc.)
4. Preencha os detalhes da manifestação
5. Envie a manifestação
6. Verifique se a manifestação foi registrada no sistema

## 5. Testando Funcionalidades Específicas

### Testes de Usuário

Para testar diferentes perfis de usuário, faça login com diferentes credenciais e verifique:
- Se as permissões estão corretas (acesso apenas aos módulos permitidos)
- Se as funcionalidades específicas de cada perfil estão disponíveis
- Se as restrições de acesso estão funcionando corretamente

### Testes de Responsividade

O sistema foi projetado para ser responsivo. Teste em diferentes dispositivos:
- Desktop (resolução padrão)
- Tablet (resolução média)
- Smartphone (resolução pequena)

Verifique se a interface se adapta corretamente a cada tamanho de tela.

## 6. Solução de Problemas Comuns

### Problemas de Conexão com o Backend

Se o frontend não conseguir se conectar ao backend:

1. Verifique se o backend está em execução
2. Confirme se as portas estão corretas (5011 para o backend)
3. Verifique se não há bloqueios de firewall ou CORS
4. Verifique os logs do backend para identificar possíveis erros

### Problemas de Autenticação

Se não conseguir fazer login:

1. Verifique se as credenciais estão corretas
2. Confirme se o backend está processando as solicitações de autenticação
3. Verifique se o token JWT está sendo gerado e armazenado corretamente
4. Limpe o cache do navegador e tente novamente

### Erros no Console

Se encontrar erros no console do navegador:

1. Abra as ferramentas de desenvolvedor do navegador (F12)
2. Verifique a aba "Console" para mensagens de erro
3. Analise os erros e tente identificar a causa
4. Verifique se há problemas de rede na aba "Network"

## 7. Executando Testes Automatizados

O sistema inclui testes automatizados que podem ser executados para verificar a integridade do código:

### Testes Frontend

```bash
cd frontend
npm test
```

### Testes Backend

```bash
cd backend
./mvnw test
```

## 8. Encerrando o Sistema

### Docker

Se estiver usando Docker, pressione `Ctrl+C` no terminal onde o docker-compose está em execução, ou execute:

```bash
docker-compose down
```

### Execução Manual

- Para o frontend: Pressione `Ctrl+C` no terminal onde o servidor Vite está em execução
- Para o backend: Pressione `Ctrl+C` no terminal onde o Spring Boot está em execução

## Suporte e Recursos Adicionais

- **Documentação Técnica**: Consulte a pasta `docs/` para documentação técnica específica dos módulos
- **Código Fonte**: Explore o código fonte nas pastas `frontend/` e `backend/` para entender a implementação
- **Issues**: Reporte problemas ou sugestões através do sistema de issues do repositório