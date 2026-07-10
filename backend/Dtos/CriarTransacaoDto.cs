using System.ComponentModel.DataAnnotations;
using ControleGastos.Api.Entities;

namespace ControleGastos.Api.Dtos;

public class CriarTransacaoDto
{
    [Required]
    [StringLength(100)]
    public string Descricao { get; set; } = string.Empty;

    [Range(typeof(decimal), "0.01", "79228162514264337593543950335")]
    public decimal Valor { get; set; }

    [EnumDataType(typeof(TipoTransacao))]
    public TipoTransacao Tipo { get; set; }

    [Range(1, int.MaxValue)]
    public int PessoaId { get; set; }
}

