using ControleGastos.Api.Dtos;
using ControleGastos.Api.Mappers;
using ControleGastos.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace ControleGastos.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PessoasController : ControllerBase
{
    private readonly PessoaService _pessoaService;

    public PessoasController(PessoaService pessoaService)
    {
        _pessoaService = pessoaService;
    }

    [HttpGet]
    public async Task<ActionResult<List<PessoaDto>>> Listar()
    {
        var pessoas = await _pessoaService.ListarAsync();
        return Ok(PessoaMapper.ToDtoList(pessoas));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PessoaDto>> ObterPorId(int id)
    {
        var pessoa = await _pessoaService.ObterPorIdAsync(id);

        if (pessoa is null)
        {
            return NotFound();
        }

        return Ok(PessoaMapper.ToDto(pessoa));
    }

    [HttpPost]
    public async Task<ActionResult<PessoaDto>> Criar(CriarPessoaDto dto)
    {
        var pessoa = PessoaMapper.ToEntity(dto);
        var pessoaCriada = await _pessoaService.CriarAsync(pessoa);
        var pessoaDto = PessoaMapper.ToDto(pessoaCriada);

        return CreatedAtAction(nameof(ObterPorId), new { id = pessoaDto.Id }, pessoaDto);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Deletar(int id)
    {
        var pessoaFoiDeletada = await _pessoaService.DeletarAsync(id);

        if (!pessoaFoiDeletada)
        {
            return NotFound();
        }

        return NoContent();
    }
}
