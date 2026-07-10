using ControleGastos.Api.Dtos;
using ControleGastos.Api.Mappers;
using ControleGastos.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace ControleGastos.Api.Controllers;

[ApiController]
[Route("api/totais")]
public class TotaisController : ControllerBase
{
    private readonly TotaisService _totaisService;

    public TotaisController(TotaisService totaisService)
    {
        _totaisService = totaisService;
    }

    [HttpGet]
    public async Task<ActionResult<TotaisDto>> ObterTotais()
    {
        var resultado = await _totaisService.ObterTotaisAsync();
        var totaisDto = TotaisMapper.ToDto(resultado);

        return Ok(totaisDto);
    }
}
