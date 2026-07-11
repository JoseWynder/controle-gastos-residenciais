using ControleGastos.Api.Entities;
using ControleGastos.Api.Services;
using ControleGastos.Api.Tests.Helpers;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace ControleGastos.Api.Tests.Services;

public class PessoaServiceTests
{
    [Fact]
    public async Task DeletarAsync_DeveRemoverTransacoesRelacionadasEPreservarAsDemais_QuandoPessoaExiste()
    {
        await using var database = await SqliteTestDatabase.CreateAsync();
        int pessoaRemovidaId;
        int pessoaPreservadaId;

        await using (var context = database.CreateContext())
        {
            var pessoaRemovida = new Pessoa
            {
                Nome = "Pessoa removida",
                Idade = 30,
                Transacoes = new List<Transacao>
                {
                    new()
                    {
                        Descricao = "Receita removida",
                        Valor = 100m,
                        Tipo = TipoTransacao.Receita
                    },
                    new()
                    {
                        Descricao = "Despesa removida",
                        Valor = 25m,
                        Tipo = TipoTransacao.Despesa
                    }
                }
            };
            var pessoaPreservada = new Pessoa
            {
                Nome = "Pessoa preservada",
                Idade = 30,
                Transacoes = new List<Transacao>
                {
                    new()
                    {
                        Descricao = "Despesa preservada",
                        Valor = 15m,
                        Tipo = TipoTransacao.Despesa
                    }
                }
            };

            context.Pessoas.AddRange(pessoaRemovida, pessoaPreservada);
            await context.SaveChangesAsync();
            pessoaRemovidaId = pessoaRemovida.Id;
            pessoaPreservadaId = pessoaPreservada.Id;
        }

        bool pessoaFoiDeletada;
        await using (var context = database.CreateContext())
        {
            var service = new PessoaService(context);
            pessoaFoiDeletada = await service.DeletarAsync(pessoaRemovidaId);
        }

        await using (var context = database.CreateContext())
        {
            var pessoas = await context.Pessoas
                .AsNoTracking()
                .OrderBy(pessoa => pessoa.Id)
                .ToListAsync();
            var transacoes = await context.Transacoes
                .AsNoTracking()
                .OrderBy(transacao => transacao.Id)
                .ToListAsync();

            Assert.True(pessoaFoiDeletada);
            Assert.DoesNotContain(pessoas, pessoa => pessoa.Id == pessoaRemovidaId);
            Assert.DoesNotContain(transacoes, transacao => transacao.PessoaId == pessoaRemovidaId);
            var pessoaPreservada = Assert.Single(pessoas);
            var transacaoPreservada = Assert.Single(transacoes);
            Assert.Equal(pessoaPreservadaId, pessoaPreservada.Id);
            Assert.Equal("Pessoa preservada", pessoaPreservada.Nome);
            Assert.Equal(pessoaPreservadaId, transacaoPreservada.PessoaId);
            Assert.Equal("Despesa preservada", transacaoPreservada.Descricao);
            Assert.Equal(15m, transacaoPreservada.Valor);
            Assert.Equal(TipoTransacao.Despesa, transacaoPreservada.Tipo);
        }
    }
}