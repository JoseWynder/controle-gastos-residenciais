using ControleGastos.Api.Dtos;
using ControleGastos.Api.Mappers;
using ControleGastos.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace ControleGastos.Api.Controllers;

[ApiController]
[Route("api/transacoes")]
public class TransacoesController : ControllerBase
{
    private readonly TransacaoService _transacaoService;

    public TransacoesController(TransacaoService transacaoService)
    {
        _transacaoService = transacaoService;
    }

    [HttpGet]
    public async Task<ActionResult<List<TransacaoDto>>> Listar()
    {
        var transacoes = await _transacaoService.ListarAsync();
        return Ok(TransacaoMapper.ToDtoList(transacoes));
    }

    [HttpPost]
    public async Task<ActionResult<TransacaoDto>> Criar(CriarTransacaoDto dto)
    {
        var transacao = TransacaoMapper.ToEntity(dto);
        var resultado = await _transacaoService.CriarAsync(transacao);

        if (resultado.Status == CriarTransacaoStatus.PessoaNaoEncontrada)
        {
            return PessoaNaoEncontrada();
        }

        if (resultado.Status == CriarTransacaoStatus.ReceitaNaoPermitidaParaMenorDeIdade)
        {
            return ReceitaNaoPermitidaParaMenorDeIdade();
        }

        var transacaoDto = TransacaoMapper.ToDto(resultado.Transacao!);
        return StatusCode(StatusCodes.Status201Created, transacaoDto);
    }

    private ObjectResult PessoaNaoEncontrada()
    {
        return Problem(
            title: "Pessoa não encontrada",
            detail: "Não foi encontrada uma pessoa com o identificador informado.",
            statusCode: StatusCodes.Status404NotFound,
            extensions: new Dictionary<string, object?>
            {
                ["codigo"] = "pessoa_nao_encontrada"
            });
    }

    private ObjectResult ReceitaNaoPermitidaParaMenorDeIdade()
    {
        return Problem(
            title: "Transação não permitida",
            detail: "Pessoas menores de idade só podem cadastrar despesas.",
            statusCode: StatusCodes.Status400BadRequest,
            extensions: new Dictionary<string, object?>
            {
                ["codigo"] = "receita_nao_permitida_para_menor_de_idade"
            });
    }
}