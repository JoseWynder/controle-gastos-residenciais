using ControleGastos.Api.Dtos;
using ControleGastos.Api.Entities;

namespace ControleGastos.Api.Mappers;

public static class PessoaMapper
{
    public static Pessoa ToEntity(CriarPessoaDto dto)
    {
        return new Pessoa
        {
            Nome = dto.Nome,
            Idade = dto.Idade
        };
    }

    public static PessoaDto ToDto(Pessoa pessoa)
    {
        return new PessoaDto
        {
            Id = pessoa.Id,
            Nome = pessoa.Nome,
            Idade = pessoa.Idade
        };
    }

    public static List<PessoaDto> ToDtoList(IEnumerable<Pessoa> pessoas)
    {
        return pessoas.Select(ToDto).ToList();
    }
}
