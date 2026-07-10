using System.ComponentModel.DataAnnotations;

namespace ControleGastos.Api.Dtos;

public class CriarPessoaDto
{
    [Required(ErrorMessage = "O nome é obrigatório.")]
    public string Nome { get; set; } = string.Empty;

    [Range(0, 130, ErrorMessage = "A idade deve estar entre 0 e 130 anos.")]
    public int Idade { get; set; }
}