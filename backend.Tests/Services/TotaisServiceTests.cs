using ControleGastos.Api.Entities;
using ControleGastos.Api.Services;
using ControleGastos.Api.Tests.Helpers;
using Xunit;

namespace ControleGastos.Api.Tests.Services;

public class TotaisServiceTests
{
    [Fact]
    public async Task ObterTotaisAsync_DeveRetornarListaVaziaETotalGeralZerado_QuandoNaoExistemPessoas()
    {
        await using var database = await SqliteTestDatabase.CreateAsync();
        await using var context = database.CreateContext();
        var service = new TotaisService(context);

        var resultado = await service.ObterTotaisAsync();

        Assert.Empty(resultado.TotaisPorPessoa);
        Assert.Equal(0m, resultado.TotalGeral.TotalReceitas);
        Assert.Equal(0m, resultado.TotalGeral.TotalDespesas);
        Assert.Equal(0m, resultado.TotalGeral.Saldo);
    }

    [Theory]
    [MemberData(nameof(CenariosTotaisPessoaIndividual))]
    public async Task ObterTotaisAsync_DeveCalcularTotaisDaPessoa_ConformeSuasTransacoes(
        TransacaoTeste[] transacoes,
        decimal totalReceitasEsperado,
        decimal totalDespesasEsperado,
        decimal saldoEsperado)
    {
        await using var database = await SqliteTestDatabase.CreateAsync();
        var pessoa = await AdicionarPessoaAsync(database, "Pessoa", 30);
        await AdicionarTransacoesAsync(database, pessoa.Id, transacoes);
        await using var context = database.CreateContext();
        var service = new TotaisService(context);

        var resultado = await service.ObterTotaisAsync();

        var totalPessoa = Assert.Single(resultado.TotaisPorPessoa);
        Assert.Equal(pessoa.Id, totalPessoa.PessoaId);
        Assert.Equal(pessoa.Nome, totalPessoa.Nome);
        Assert.Equal(totalReceitasEsperado, totalPessoa.TotalReceitas);
        Assert.Equal(totalDespesasEsperado, totalPessoa.TotalDespesas);
        Assert.Equal(saldoEsperado, totalPessoa.Saldo);
        Assert.Equal(totalReceitasEsperado, resultado.TotalGeral.TotalReceitas);
        Assert.Equal(totalDespesasEsperado, resultado.TotalGeral.TotalDespesas);
        Assert.Equal(saldoEsperado, resultado.TotalGeral.Saldo);
    }

    [Fact]
    public async Task ObterTotaisAsync_DeveCalcularTotaisIndividuaisETotalGeral_QuandoExistemMultiplasPessoas()
    {
        await using var database = await SqliteTestDatabase.CreateAsync();
        var adulto = await AdicionarPessoaAsync(database, "Adulto", 30);
        var semTransacoes = await AdicionarPessoaAsync(database, "Sem transacoes", 40);
        var menor = await AdicionarPessoaAsync(database, "Menor", 16);
        await AdicionarTransacoesAsync(database, adulto.Id, new[]
        {
            new TransacaoTeste(TipoTransacao.Receita, 100m),
            new TransacaoTeste(TipoTransacao.Despesa, 35m)
        });
        await AdicionarTransacoesAsync(database, menor.Id, new[]
        {
            new TransacaoTeste(TipoTransacao.Despesa, 12m)
        });
        await using var context = database.CreateContext();
        var service = new TotaisService(context);

        var resultado = await service.ObterTotaisAsync();

        Assert.Equal(3, resultado.TotaisPorPessoa.Count);
        AssertTotalPessoa(resultado, adulto.Id, "Adulto", 100m, 35m, 65m);
        AssertTotalPessoa(resultado, semTransacoes.Id, "Sem transacoes", 0m, 0m, 0m);
        AssertTotalPessoa(resultado, menor.Id, "Menor", 0m, 12m, -12m);
        Assert.Equal(100m, resultado.TotalGeral.TotalReceitas);
        Assert.Equal(47m, resultado.TotalGeral.TotalDespesas);
        Assert.Equal(53m, resultado.TotalGeral.Saldo);
    }

    public static IEnumerable<object[]> CenariosTotaisPessoaIndividual()
    {
        yield return new object[]
        {
            Array.Empty<TransacaoTeste>(),
            0m,
            0m,
            0m
        };

        yield return new object[]
        {
            new[]
            {
                new TransacaoTeste(TipoTransacao.Receita, 100m),
                new TransacaoTeste(TipoTransacao.Receita, 50m)
            },
            150m,
            0m,
            150m
        };

        yield return new object[]
        {
            new[]
            {
                new TransacaoTeste(TipoTransacao.Despesa, 30m),
                new TransacaoTeste(TipoTransacao.Despesa, 20m)
            },
            0m,
            50m,
            -50m
        };

        yield return new object[]
        {
            new[]
            {
                new TransacaoTeste(TipoTransacao.Receita, 200m),
                new TransacaoTeste(TipoTransacao.Despesa, 80m)
            },
            200m,
            80m,
            120m
        };
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

    private static async Task AdicionarTransacoesAsync(
        SqliteTestDatabase database,
        int pessoaId,
        IEnumerable<TransacaoTeste> transacoes)
    {
        await using var context = database.CreateContext();

        foreach (var transacao in transacoes)
        {
            context.Transacoes.Add(new Transacao
            {
                Descricao = "Transacao",
                Valor = transacao.Valor,
                Tipo = transacao.Tipo,
                PessoaId = pessoaId
            });
        }

        await context.SaveChangesAsync();
    }

    private static void AssertTotalPessoa(
        TotaisResultado resultado,
        int pessoaId,
        string nome,
        decimal totalReceitas,
        decimal totalDespesas,
        decimal saldo)
    {
        var totalPessoa = resultado.TotaisPorPessoa.Single(total => total.PessoaId == pessoaId);
        Assert.Equal(nome, totalPessoa.Nome);
        Assert.Equal(totalReceitas, totalPessoa.TotalReceitas);
        Assert.Equal(totalDespesas, totalPessoa.TotalDespesas);
        Assert.Equal(saldo, totalPessoa.Saldo);
    }

    public record TransacaoTeste(TipoTransacao Tipo, decimal Valor);
}