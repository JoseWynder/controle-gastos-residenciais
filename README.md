# Controle de Gastos Residenciais

Aplicação fullstack para cadastro de pessoas, controle de receitas e despesas residenciais e consulta de totais por pessoa e total geral.

## Funcionalidades

- Cadastro, listagem, consulta e exclusão de pessoas.
- Cadastro e listagem de transações.
- Visualização dos totais de receitas, despesas e saldo por pessoa.
- Visualização do total geral de receitas, despesas e saldo líquido.
- Interface web com áreas de Pessoas, Transações e Totais.

## Regras de negócio

- Uma pessoa possui identificador gerado automaticamente, nome e idade.
- Ao remover uma pessoa, suas transações relacionadas também são removidas.
- Uma transação pertence a uma pessoa existente.
- Uma transação pode ser do tipo despesa ou receita.
- Pessoas menores de 18 anos só podem cadastrar despesas.
- Os totais por pessoa exibem receitas, despesas e saldo, calculado como receitas menos despesas.
- O total geral consolida receitas, despesas e saldo líquido de todas as pessoas.
- Pessoas sem transações permanecem na consulta de totais com valores zerados.

## Tecnologias

- .NET 10
- ASP.NET Core Web API
- Entity Framework Core
- SQLite
- xUnit
- React
- TypeScript
- Vite
- npm
- Vitest
- React Testing Library
- jsdom
- GitHub Actions

## Arquitetura

O fluxo principal da aplicação é simples:

```text
React -> Controllers -> Services -> AppDbContext -> SQLite
```

No backend, os controllers recebem requisições HTTP, usam DTOs na entrada e saída e delegam as regras de negócio para os services. Os mappers fazem conversões manuais entre DTOs e entidades. O acesso ao banco é feito diretamente pelo `AppDbContext`, sem uma camada Repository adicional.

No frontend, os componentes consomem a API com `fetch` nativo, mantêm estado local simples e exibem mensagens de carregamento, erro e vazio conforme o retorno da aplicação.

## Estrutura do repositório

```text
.
├── .config/
│   └── dotnet-tools.json
├── .github/
│   └── workflows/
├── backend/
├── backend.Tests/
├── frontend/
├── .gitignore
├── ControleGastos.sln
└── README.md
```

- `backend/`: API ASP.NET Core, entidades, DTOs, controllers, services, mappers, migrations e configuração de persistência.
- `backend.Tests/`: testes automatizados do backend.
- `frontend/`: aplicação React com TypeScript.
- `.github/workflows/`: workflows de integração contínua.
- `.config/dotnet-tools.json`: manifesto da ferramenta local `dotnet-ef`.
- `ControleGastos.sln`: solution com os projetos .NET.

## Pré-requisitos

- .NET SDK 10
- Node.js 24
- npm
- Git para clonar o repositório

Não é necessário instalar SQLite separadamente. O banco é criado em arquivo local pelo provider SQLite do EF Core.

Também não é necessário instalar o `dotnet-ef` globalmente. O projeto usa uma ferramenta local versionada no repositório.

## Configuração do projeto

Execute os comandos a partir da raiz do repositório.

### Backend

Restaure a ferramenta local do EF Core:

```bash
dotnet tool restore
```

Restaure as dependências da solution:

```bash
dotnet restore ControleGastos.sln
```

Crie ou atualize o banco SQLite local aplicando as migrations:

```bash
dotnet tool run dotnet-ef database update --project backend/ControleGastos.Api.csproj --startup-project backend/ControleGastos.Api.csproj
```

As migrations são aplicadas explicitamente por comando. A aplicação não executa migrations automaticamente no startup.

O arquivo SQLite local não é versionado. Os dados persistem enquanto esse arquivo existir. Se ele for removido, o banco pode ser recriado aplicando as migrations novamente.

### Frontend

Instale as dependências do frontend:

```bash
cd frontend
npm ci
```

Crie o arquivo local de ambiente a partir do exemplo versionado.

No PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Em sistemas compatíveis com `cp`:

```bash
cp .env.example .env.local
```

O conteúdo esperado é:

```env
VITE_API_URL=http://localhost:5255
```

O arquivo `frontend/.env.local` é local e não deve ser versionado.

## Execução da aplicação

Use dois terminais: um para o backend e outro para o frontend.

### Terminal 1: backend

Na raiz do repositório, execute:

```bash
dotnet run --project backend/ControleGastos.Api.csproj --launch-profile http
```

Com esse perfil, a API fica disponível em:

```text
http://localhost:5255
```

### Terminal 2: frontend

No diretório `frontend`, execute:

```bash
npm run dev
```

O Vite normalmente disponibiliza a interface em:

```text
http://localhost:5173
```

## Endpoints

### Pessoas

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/pessoas` | Lista pessoas cadastradas. |
| `GET` | `/api/pessoas/{id}` | Consulta uma pessoa por identificador. |
| `POST` | `/api/pessoas` | Cria uma pessoa. |
| `DELETE` | `/api/pessoas/{id}` | Remove uma pessoa e suas transações relacionadas. |

### Transações

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/transacoes` | Lista transações cadastradas. |
| `POST` | `/api/transacoes` | Cria uma transação. |

### Totais

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/totais` | Consulta totais por pessoa e total geral. |

Validações e falhas esperadas de negócio retornam respostas estruturadas em `application/problem+json`.

## Testes e verificações

### Backend

Na raiz do repositório:

```bash
dotnet build ControleGastos.sln
dotnet test ControleGastos.sln
```

Os testes do backend usam SQLite em memória e cobrem regras de transações, cálculo de totais e exclusão em cascata.

### Frontend

No diretório `frontend`:

```bash
npm run lint
npm run build
npm test
```

Os testes do frontend usam Vitest, jsdom e React Testing Library. Eles validam comportamentos observáveis dos formulários, listas e visualização de totais.

## Integração contínua

O projeto possui dois workflows no GitHub Actions:

- `.github/workflows/backend-ci.yml`
- `.github/workflows/frontend-ci.yml`

Ambos executam em push para `master` e em pull requests direcionados à `master`.

O workflow do backend restaura dependências, compila a solution e executa os testes .NET.

O workflow do frontend instala dependências com `npm ci`, executa lint, build e testes.

## Decisões técnicas

- Controllers são mantidos finos e traduzem requisições e respostas HTTP.
- Services concentram regras de negócio e trabalham com entidades.
- DTOs ficam nas fronteiras da API para separar contratos HTTP das entidades persistidas.
- Mappers manuais foram usados para evitar dependências desnecessárias.
- O projeto usa `AppDbContext` diretamente, sem Repository Pattern, mantendo a arquitetura simples.
- A persistência usa EF Core com SQLite e migrations aplicadas explicitamente.
- Falhas esperadas de negócio são tratadas por resultados estruturados, sem exceptions para fluxo normal.
- O handler global é reservado para exceções inesperadas.
- O frontend usa estado local simples e `fetch` nativo para comunicação com a API.
- Carregamentos principais usam `AbortController` para evitar atualizações após cancelamento.
- Após mutações, o frontend atualiza o estado local para manter a interface coerente.
- Os totais são sempre consumidos do backend, sem cálculo local no frontend.
- Os testes do backend usam SQLite em memória, sem `EFCore.InMemory`, para se aproximar do provider real.
- Os testes do frontend focam comportamento observável com React Testing Library.
- Os workflows de CI são separados para backend e frontend.

## Limitações intencionais

- Não há edição ou exclusão de transações.
- Não há autenticação ou autorização.
- Não há gráficos ou dashboard visual avançado.
- Não há deploy configurado.
- A navegação do frontend é simples, sem múltiplas páginas ou React Router.
