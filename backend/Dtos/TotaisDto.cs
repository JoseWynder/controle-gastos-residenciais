namespace ControleGastos.Api.Dtos;

public class TotaisDto
{
    public List<TotalPessoaDto> TotaisPorPessoa { get; set; } = new();
    public TotalGeralDto TotalGeral { get; set; } = new();
}
