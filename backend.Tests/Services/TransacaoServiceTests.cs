using ControleGastos.Api.Data;
using ControleGastos.Api.Entities;
using ControleGastos.Api.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace ControleGastos.Api.Tests.Services;

public class TransacaoServiceTests
{
    [Fact]
    public async Task CriarAsync_DeveRetornarPessoaNaoEncontrada_QuandoPessoaNaoExiste()
    {
        using var connection = CriarConexaoAberta();
        await CriarBancoAsync(connection);

        var resultado = await CriarTransacaoAsync(connection, new Transacao
        {
            Descricao = "Compra",
            Valor = 10m,
            Tipo = TipoTransacao.Despesa,
            PessoaId = 999
        });

        var transacoes = await ListarTransacoesPersistidasAsync(connection);

        Assert.Equal(CriarTransacaoStatus.PessoaNaoEncontrada, resultado.Status);
        Assert.Null(resultado.Transacao);
        Assert.Empty(transacoes);
    }

    [Fact]
    public async Task CriarAsync_DeveBloquearReceita_QuandoPessoaTem17Anos()
    {
        using var connection = CriarConexaoAberta();
        await CriarBancoAsync(connection);
        var pessoa = await AdicionarPessoaAsync(connection, "Menor", 17);

        var resultado = await CriarTransacaoAsync(connection, new Transacao
        {
            Descricao = "Receita",
            Valor = 50m,
            Tipo = TipoTransacao.Receita,
            PessoaId = pessoa.Id
        });

        var transacoes = await ListarTransacoesPersistidasAsync(connection);

        Assert.Equal(CriarTransacaoStatus.ReceitaNaoPermitidaParaMenorDeIdade, resultado.Status);
        Assert.Null(resultado.Transacao);
        Assert.Empty(transacoes);
    }

    [Fact]
    public async Task CriarAsync_DevePermitirDespesa_QuandoPessoaTem17Anos()
    {
        using var connection = CriarConexaoAberta();
        await CriarBancoAsync(connection);
        var pessoa = await AdicionarPessoaAsync(connection, "Menor", 17);

        var resultado = await CriarTransacaoAsync(connection, new Transacao
        {
            Descricao = "Lanche",
            Valor = 12m,
            Tipo = TipoTransacao.Despesa,
            PessoaId = pessoa.Id
        });

        var transacoes = await ListarTransacoesPersistidasAsync(connection);

        Assert.Equal(CriarTransacaoStatus.Sucesso, resultado.Status);
        Assert.NotNull(resultado.Transacao);
        Assert.Single(transacoes);
        Assert.Equal("Lanche", transacoes[0].Descricao);
        Assert.Equal(12m, transacoes[0].Valor);
        Assert.Equal(TipoTransacao.Despesa, transacoes[0].Tipo);
        Assert.Equal(pessoa.Id, transacoes[0].PessoaId);
    }

    [Fact]
    public async Task CriarAsync_DevePermitirReceita_QuandoPessoaTem18Anos()
    {
        using var connection = CriarConexaoAberta();
        await CriarBancoAsync(connection);
        var pessoa = await AdicionarPessoaAsync(connection, "Adulto", 18);

        var resultado = await CriarTransacaoAsync(connection, new Transacao
        {
            Descricao = "Salario",
            Valor = 100m,
            Tipo = TipoTransacao.Receita,
            PessoaId = pessoa.Id
        });

        var transacoes = await ListarTransacoesPersistidasAsync(connection);

        Assert.Equal(CriarTransacaoStatus.Sucesso, resultado.Status);
        Assert.NotNull(resultado.Transacao);
        Assert.Single(transacoes);
        Assert.Equal("Salario", transacoes[0].Descricao);
        Assert.Equal(100m, transacoes[0].Valor);
        Assert.Equal(TipoTransacao.Receita, transacoes[0].Tipo);
        Assert.Equal(pessoa.Id, transacoes[0].PessoaId);
    }

    private static SqliteConnection CriarConexaoAberta()
    {
        var connection = new SqliteConnection("DataSource=:memory:");
        connection.Open();
        return connection;
    }

    private static DbContextOptions<AppDbContext> CriarOptions(SqliteConnection connection)
    {
        return new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(connection)
            .Options;
    }

    private static async Task CriarBancoAsync(SqliteConnection connection)
    {
        await using var context = new AppDbContext(CriarOptions(connection));
        await context.Database.EnsureCreatedAsync();
    }

    private static async Task<Pessoa> AdicionarPessoaAsync(SqliteConnection connection, string nome, int idade)
    {
        await using var context = new AppDbContext(CriarOptions(connection));
        var pessoa = new Pessoa
        {
            Nome = nome,
            Idade = idade
        };

        context.Pessoas.Add(pessoa);
        await context.SaveChangesAsync();

        return pessoa;
    }

    private static async Task<CriarTransacaoResultado> CriarTransacaoAsync(
        SqliteConnection connection,
        Transacao transacao)
    {
        await using var context = new AppDbContext(CriarOptions(connection));
        var service = new TransacaoService(context);

        return await service.CriarAsync(transacao);
    }

    private static async Task<List<Transacao>> ListarTransacoesPersistidasAsync(SqliteConnection connection)
    {
        await using var context = new AppDbContext(CriarOptions(connection));

        return await context.Transacoes
            .AsNoTracking()
            .OrderBy(transacao => transacao.Id)
            .ToListAsync();
    }
}