using System.ComponentModel.DataAnnotations;

namespace ControleGastos.Api.Dtos;

public class CriarPessoaDto
{
    [Required]
    public string Nome { get; set; } = string.Empty;

    [Range(0, 130)]
    public int Idade { get; set; }
}
