using ControleGastos.Api.Entities;
using ControleGastos.Api.Services;
using ControleGastos.Api.Tests.Helpers;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace ControleGastos.Api.Tests.Services;

public class TransacaoServiceTests
{
    [Fact]
    public async Task CriarAsync_DeveRetornarPessoaNaoEncontrada_QuandoPessoaNaoExiste()
    {
        await using var database = await SqliteTestDatabase.CreateAsync();

        var resultado = await CriarTransacaoAsync(database, new Transacao
        {
            Descricao = "Compra",
            Valor = 10m,
            Tipo = TipoTransacao.Despesa,
            PessoaId = 999
        });

        var transacoes = await ListarTransacoesPersistidasAsync(database);

        Assert.Equal(CriarTransacaoStatus.PessoaNaoEncontrada, resultado.Status);
        Assert.Null(resultado.Transacao);
        Assert.Empty(transacoes);
    }

    [Fact]
    public async Task CriarAsync_DeveBloquearReceita_QuandoPessoaTem17Anos()
    {
        await using var database = await SqliteTestDatabase.CreateAsync();
        var pessoa = await AdicionarPessoaAsync(database, "Menor", 17);

        var resultado = await CriarTransacaoAsync(database, new Transacao
        {
            Descricao = "Receita",
            Valor = 50m,
            Tipo = TipoTransacao.Receita,
            PessoaId = pessoa.Id
        });

        var transacoes = await ListarTransacoesPersistidasAsync(database);

        Assert.Equal(CriarTransacaoStatus.ReceitaNaoPermitidaParaMenorDeIdade, resultado.Status);
        Assert.Null(resultado.Transacao);
        Assert.Empty(transacoes);
    }

    [Fact]
    public async Task CriarAsync_DevePermitirDespesa_QuandoPessoaTem17Anos()
    {
        await using var database = await SqliteTestDatabase.CreateAsync();
        var pessoa = await AdicionarPessoaAsync(database, "Menor", 17);

        var resultado = await CriarTransacaoAsync(database, new Transacao
        {
            Descricao = "Lanche",
            Valor = 12m,
            Tipo = TipoTransacao.Despesa,
            PessoaId = pessoa.Id
        });

        var transacoes = await ListarTransacoesPersistidasAsync(database);

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
        await using var database = await SqliteTestDatabase.CreateAsync();
        var pessoa = await AdicionarPessoaAsync(database, "Adulto", 18);

        var resultado = await CriarTransacaoAsync(database, new Transacao
        {
            Descricao = "Salario",
            Valor = 100m,
            Tipo = TipoTransacao.Receita,
            PessoaId = pessoa.Id
        });

        var transacoes = await ListarTransacoesPersistidasAsync(database);

        Assert.Equal(CriarTransacaoStatus.Sucesso, resultado.Status);
        Assert.NotNull(resultado.Transacao);
        Assert.Single(transacoes);
        Assert.Equal("Salario", transacoes[0].Descricao);
        Assert.Equal(100m, transacoes[0].Valor);
        Assert.Equal(TipoTransacao.Receita, transacoes[0].Tipo);
        Assert.Equal(pessoa.Id, transacoes[0].PessoaId);
    }

    private static async Task<Pessoa> AdicionarPessoaAsync(SqliteTestDatabase database, string nome, int idade)
    {
        await using var context = database.CreateContext();
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
        SqliteTestDatabase database,
        Transacao transacao)
    {
        await using var context = database.CreateContext();
        var service = new TransacaoService(context);

        return await service.CriarAsync(transacao);
    }

    private static async Task<List<Transacao>> ListarTransacoesPersistidasAsync(SqliteTestDatabase database)
    {
        await using var context = database.CreateContext();

        return await context.Transacoes
            .AsNoTracking()
            .OrderBy(transacao => transacao.Id)
            .ToListAsync();
    }
}