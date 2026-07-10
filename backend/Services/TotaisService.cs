using ControleGastos.Api.Data;
using ControleGastos.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace ControleGastos.Api.Services;

public class TotaisService
{
    private readonly AppDbContext _context;

    public TotaisService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<TotaisResultado> ObterTotaisAsync()
    {
        var pessoas = await _context.Pessoas
            .AsNoTracking()
            .Include(pessoa => pessoa.Transacoes)
            .ToListAsync();

        var totaisPorPessoa = pessoas
            .Select(pessoa =>
            {
                var totalReceitas = pessoa.Transacoes
                    .Where(transacao => transacao.Tipo == TipoTransacao.Receita)
                    .Sum(transacao => transacao.Valor);

                var totalDespesas = pessoa.Transacoes
                    .Where(transacao => transacao.Tipo == TipoTransacao.Despesa)
                    .Sum(transacao => transacao.Valor);

                return new TotalPessoaResultado(
                    pessoa.Id,
                    pessoa.Nome,
                    totalReceitas,
                    totalDespesas,
                    totalReceitas - totalDespesas);
            })
            .ToList();

        var totalGeralReceitas = totaisPorPessoa.Sum(total => total.TotalReceitas);
        var totalGeralDespesas = totaisPorPessoa.Sum(total => total.TotalDespesas);
        var totalGeral = new TotalGeralResultado(
            totalGeralReceitas,
            totalGeralDespesas,
            totalGeralReceitas - totalGeralDespesas);

        return new TotaisResultado(totaisPorPessoa, totalGeral);
    }
}

public record TotalPessoaResultado(
    int PessoaId,
    string Nome,
    decimal TotalReceitas,
    decimal TotalDespesas,
    decimal Saldo);

public record TotalGeralResultado(
    decimal TotalReceitas,
    decimal TotalDespesas,
    decimal Saldo);

public record TotaisResultado(
    List<TotalPessoaResultado> TotaisPorPessoa,
    TotalGeralResultado TotalGeral);
