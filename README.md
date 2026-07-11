# Controle de Gastos Residenciais

API para controle de gastos residenciais, com cadastro de pessoas, registro de transações e consulta de totais por pessoa e total geral.

## Status atual

O backend está funcional, com persistência em SQLite, migrations, tratamento de erros, testes automatizados essenciais e workflow de CI.

O frontend ainda será desenvolvido em uma etapa futura.

## Tecnologias

- .NET 10
- ASP.NET Core Web API
- Entity Framework Core
- SQLite
- EF Core Migrations
- xUnit
- GitHub Actions

## Pré-requisitos

- .NET SDK 10 instalado
- Terminal ou PowerShell
- Acesso ao repositório clonado localmente

Não é necessário instalar o `dotnet-ef` globalmente. O projeto usa ferramenta local versionada no repositório.

## Configuração inicial

Execute os comandos a partir da raiz do repositório.

Restaure as ferramentas locais:

```powershell
dotnet tool restore
```

Restaure as dependências da solution:

```powershell
dotnet restore ControleGastos.sln
```

## Banco de dados e migrations

A aplicação usa SQLite com EF Core Migrations. O arquivo do banco é local e não versionado.

Os dados persistem enquanto o arquivo SQLite existir. Se o arquivo for excluído, os dados também serão removidos. O banco pode ser recriado aplicando as migrations novamente.

A aplicação não aplica migrations automaticamente no startup. Para criar ou atualizar o banco local, execute:

```powershell
dotnet tool run dotnet-ef database update --project backend/ControleGastos.Api.csproj --startup-project backend/ControleGastos.Api.csproj
```

## Execução da API

Execute a API com:

```powershell
dotnet run --project backend/ControleGastos.Api.csproj
```

Use a URL exibida no terminal após a inicialização da aplicação. Os perfis de desenvolvimento estão em `backend/Properties/launchSettings.json`.

## Build e testes

Para compilar a solution:

```powershell
dotnet build ControleGastos.sln
```

Para executar os testes automatizados:

```powershell
dotnet test ControleGastos.sln
```

Os testes usam SQLite em memória e não dependem do banco local da aplicação. A suíte atual cobre regras de transações, cálculo de totais e exclusão em cascata.

## Endpoints

### Pessoas

- `GET /api/pessoas`
- `GET /api/pessoas/{id}`
- `POST /api/pessoas`
- `DELETE /api/pessoas/{id}`

### Transações

- `GET /api/transacoes`
- `POST /api/transacoes`

### Totais

- `GET /api/totais`

## Regras de negócio

- Pessoas podem ser criadas, listadas, consultadas por id e removidas.
- Ao remover uma pessoa, suas transações relacionadas são removidas por cascade delete.
- Uma transação só pode ser criada para uma pessoa existente.
- Pessoas menores de idade só podem cadastrar despesas.
- Pessoas sem transações aparecem na consulta de totais com receitas, despesas e saldo zerados.
- O saldo é calculado como total de receitas menos total de despesas.
- O total geral consolida as receitas, despesas e saldos de todas as pessoas.

## Decisões técnicas

- Controllers são mantidos finos e ficam responsáveis por receber DTOs, chamar mappers e traduzir resultados em respostas HTTP.
- Services concentram regras de negócio e trabalham com entidades, sem conhecer DTOs.
- DTOs e mappers manuais ficam na borda da API.
- O projeto usa `AppDbContext` diretamente, sem Repository Pattern.
- As migrations são aplicadas explicitamente por comando.
- Falhas esperadas de negócio são representadas por resultados estruturados, sem uso de exceptions para fluxo normal.
- O handler global é reservado para exceções inesperadas.
- Os testes usam SQLite em memória, sem `EFCore.InMemory`, para se aproximar do provider real usado pela aplicação.

## Integração contínua

O GitHub Actions executa restore, build e testes em pull requests direcionados à `master` e em pushes na `master`.

O workflow está em `.github/workflows/backend-ci.yml`.

## Frontend

O frontend ainda será desenvolvido. Esta documentação descreve o estado atual do backend.