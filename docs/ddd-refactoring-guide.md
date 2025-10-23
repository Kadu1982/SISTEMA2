# Guia de Refatoração para Domain-Driven Design (DDD)

Este documento descreve a refatoração do projeto Cidade Saúde Digital para seguir os princípios de Domain-Driven Design (DDD). O objetivo é organizar o código por domínios de negócio em vez de camadas técnicas, tornando o sistema mais modular, manutenível e alinhado com o domínio do problema.

## Estrutura DDD Implementada

A refatoração seguiu a seguinte estrutura para cada domínio:

### Backend

1. **Camada de Domínio** (`domain`)
   - **Modelo** (`model`): Entidades e objetos de valor do domínio
   - **Repositório** (`repository`): Interfaces de repositório
   - **Serviço de Domínio** (`service`): Lógica de negócio específica do domínio

2. **Camada de Aplicação** (`application`)
   - **DTOs** (`dto`): Objetos de transferência de dados
   - **Serviços de Aplicação** (`service`): Coordenação de casos de uso
   - **Exceções** (`exception`): Exceções específicas da aplicação

3. **Camada de Infraestrutura** (`infrastructure`)
   - **Entidades JPA** (`entity`): Entidades mapeadas para o banco de dados
   - **Repositórios JPA** (`repository`): Implementações de repositório usando Spring Data
   - **Controladores** (`controller`): APIs REST

### Frontend

1. **Tipos** (`types`): Interfaces TypeScript correspondentes aos DTOs do backend
2. **Serviços** (`services`): Serviços organizados por domínio para comunicação com o backend

## Exemplo: Domínio de Paciente

### Backend

#### Camada de Domínio

- **Modelo**:
  - `Paciente`: Entidade de domínio
  - `Endereco`: Objeto de valor

- **Repositório**:
  - `PacienteRepository`: Interface que define operações de persistência

- **Serviço de Domínio**:
  - `PacienteDomainService`: Lógica de negócio específica de pacientes

#### Camada de Aplicação

- **DTOs**:
  - `PacienteDTO`: DTO completo para transferência de dados
  - `PacienteListDTO`: DTO simplificado para listagens

- **Serviço de Aplicação**:
  - `PacienteService`: Implementa casos de uso relacionados a pacientes

- **Exceções**:
  - `ResourceNotFoundException`: Exceção para recursos não encontrados
  - `BusinessException`: Exceção para violações de regras de negócio

#### Camada de Infraestrutura

- **Entidades JPA**:
  - `PacienteEntity`: Entidade JPA mapeada para a tabela de pacientes

- **Repositórios JPA**:
  - `PacienteJpaRepository`: Interface Spring Data JPA
  - `PacienteRepositoryImpl`: Implementação do repositório de domínio

- **Controladores**:
  - `PacienteController`: API REST para operações de pacientes

### Frontend

- **Tipos**:
  - `Paciente`: Interface TypeScript para dados completos de paciente
  - `PacienteList`: Interface TypeScript para listagem de pacientes

- **Serviços**:
  - `PacienteService`: Serviço para comunicação com a API de pacientes

## Como Aplicar a Outros Domínios

Para aplicar a mesma estrutura a outros domínios do sistema, siga estes passos:

1. **Identifique o Domínio**: Determine o domínio de negócio (ex: Atendimento, Farmácia, Agendamento)

2. **Crie a Estrutura de Pacotes**:
   ```
   backend/src/main/java/com/sistemadesaude/backend/
   ├── domain/
   │   └── [dominio]/
   │       ├── model/
   │       ├── repository/
   │       └── service/
   ├── application/
   │   └── [dominio]/
   │       ├── dto/
   │       └── service/
   └── infrastructure/
       └── [dominio]/
           ├── entity/
           ├── repository/
           └── controller/
   ```

3. **Implemente as Classes**:
   - Crie entidades e objetos de valor na camada de domínio
   - Defina interfaces de repositório na camada de domínio
   - Implemente serviços de domínio para lógica de negócio
   - Crie DTOs na camada de aplicação
   - Implemente serviços de aplicação para casos de uso
   - Crie entidades JPA e repositórios na camada de infraestrutura
   - Implemente controladores REST na camada de infraestrutura

4. **Frontend**:
   - Crie interfaces TypeScript correspondentes aos DTOs
   - Implemente serviços organizados por domínio

## Benefícios da Refatoração DDD

- **Foco no Domínio**: O código reflete o modelo de domínio e a linguagem ubíqua
- **Separação de Preocupações**: Cada camada tem responsabilidades bem definidas
- **Testabilidade**: Facilita a escrita de testes unitários e de integração
- **Manutenibilidade**: Mudanças em um domínio não afetam outros domínios
- **Escalabilidade**: Facilita a divisão do sistema em microserviços no futuro

## Considerações Adicionais

- **Contextos Delimitados**: Identifique e defina claramente os limites entre diferentes domínios
- **Linguagem Ubíqua**: Use termos consistentes em todo o código e documentação
- **Agregados**: Identifique agregados e suas raízes para garantir consistência
- **Eventos de Domínio**: Considere usar eventos para comunicação entre domínios

## Próximos Passos

1. Refatorar os demais domínios seguindo o mesmo padrão
2. Implementar testes para garantir que a funcionalidade não foi afetada
3. Atualizar a documentação para refletir a nova estrutura
4. Considerar a implementação de padrões adicionais como CQRS ou Event Sourcing onde apropriado