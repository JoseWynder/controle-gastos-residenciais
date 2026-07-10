using ControleGastos.Api.Dtos;
using ControleGastos.Api.Services;

namespace ControleGastos.Api.Mappers;

public static class TotaisMapper
{
    public static TotalPessoaDto ToDto(TotalPessoaResultado resultado)
    {
        return new TotalPessoaDto
        {
            PessoaId = resultado.PessoaId,
            Nome = resultado.Nome,
            TotalReceitas = resultado.TotalReceitas,
            TotalDespesas = resultado.TotalDespesas,
            Saldo = resultado.Saldo
        };
    }

    public static TotalGeralDto ToDto(TotalGeralResultado resultado)
    {
        return new TotalGeralDto
        {
            TotalReceitas = resultado.TotalReceitas,
            TotalDespesas = resultado.TotalDespesas,
            Saldo = resultado.Saldo
        };
    }

    public static TotaisDto ToDto(TotaisResultado resultado)
    {
        return new TotaisDto
        {
            TotaisPorPessoa = resultado.TotaisPorPessoa.Select(ToDto).ToList(),
            TotalGeral = ToDto(resultado.TotalGeral)
        };
    }
}
