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
            return NotFound();
        }

        if (resultado.Status == CriarTransacaoStatus.ReceitaNaoPermitidaParaMenorDeIdade)
        {
            return BadRequest();
        }

        var transacaoDto = TransacaoMapper.ToDto(resultado.Transacao!);
        return StatusCode(StatusCodes.Status201Created, transacaoDto);
    }
}
