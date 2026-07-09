namespace ControleGastos.Api.Entities;

public class Pessoa 
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public int Idade { get; set; }
    public ICollection<Transacao> Transacoes { get; set; } =  new List<Transacao>();
}