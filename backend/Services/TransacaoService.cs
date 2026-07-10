using ControleGastos.Api.Data;
using ControleGastos.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace ControleGastos.Api.Services;

public class TransacaoService
{
    private readonly AppDbContext _context;

    public TransacaoService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Transacao>> ListarAsync()
    {
        return await _context.Transacoes
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<CriarTransacaoResultado> CriarAsync(Transacao transacao)
    {
        var pessoa = await _context.Pessoas
            .AsNoTracking()
            .FirstOrDefaultAsync(pessoa => pessoa.Id == transacao.PessoaId);

        if (pessoa is null)
        {
            return CriarTransacaoResultado.PessoaNaoEncontrada();
        }

        if (pessoa.Idade < 18 && transacao.Tipo == TipoTransacao.Receita)
        {
            return CriarTransacaoResultado.ReceitaNaoPermitidaParaMenorDeIdade();
        }

        _context.Transacoes.Add(transacao);
        await _context.SaveChangesAsync();

        return CriarTransacaoResultado.Sucesso(transacao);
    }
}

public enum CriarTransacaoStatus
{
    Sucesso,
    PessoaNaoEncontrada,
    ReceitaNaoPermitidaParaMenorDeIdade
}

public record CriarTransacaoResultado(CriarTransacaoStatus Status, Transacao? Transacao)
{
    public static CriarTransacaoResultado Sucesso(Transacao transacao)
    {
        return new CriarTransacaoResultado(CriarTransacaoStatus.Sucesso, transacao);
    }

    public static CriarTransacaoResultado PessoaNaoEncontrada()
    {
        return new CriarTransacaoResultado(CriarTransacaoStatus.PessoaNaoEncontrada, null);
    }

    public static CriarTransacaoResultado ReceitaNaoPermitidaParaMenorDeIdade()
    {
        return new CriarTransacaoResultado(CriarTransacaoStatus.ReceitaNaoPermitidaParaMenorDeIdade, null);
    }
}
