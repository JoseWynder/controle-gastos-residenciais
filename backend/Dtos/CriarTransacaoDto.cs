using System.ComponentModel.DataAnnotations;
using ControleGastos.Api.Entities;

namespace ControleGastos.Api.Dtos;

public class CriarTransacaoDto
{
    [Required(ErrorMessage = "A descrição é obrigatória.")]
    [StringLength(100, ErrorMessage = "A descrição deve ter no máximo 100 caracteres.")]
    public string Descricao { get; set; } = string.Empty;

    [Range(typeof(decimal), "0.01", "79228162514264337593543950335", ErrorMessage = "O valor deve ser maior que zero.", ParseLimitsInInvariantCulture = true)]
    public decimal Valor { get; set; }

    [EnumDataType(typeof(TipoTransacao), ErrorMessage = "O tipo da transação é inválido.")]
    public TipoTransacao Tipo { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "O identificador da pessoa deve ser maior que zero.")]
    public int PessoaId { get; set; }
}