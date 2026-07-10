using ControleGastos.Api.Dtos;
using ControleGastos.Api.Entities;

namespace ControleGastos.Api.Mappers;

public static class TransacaoMapper
{
    public static Transacao ToEntity(CriarTransacaoDto dto)
    {
        return new Transacao
        {
            Descricao = dto.Descricao,
            Valor = dto.Valor,
            Tipo = dto.Tipo,
            PessoaId = dto.PessoaId
        };
    }

    public static TransacaoDto ToDto(Transacao transacao)
    {
        return new TransacaoDto
        {
            Id = transacao.Id,
            Descricao = transacao.Descricao,
            Valor = transacao.Valor,
            Tipo = transacao.Tipo,
            PessoaId = transacao.PessoaId
        };
    }

    public static List<TransacaoDto> ToDtoList(IEnumerable<Transacao> transacoes)
    {
        return transacoes.Select(ToDto).ToList();
    }
}
