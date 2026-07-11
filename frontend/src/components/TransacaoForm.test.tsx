import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TransacaoForm } from './TransacaoForm'
import type { Pessoa } from '../types/pessoa'

const pessoas: Pessoa[] = [{ id: 1, nome: 'Maria', idade: 18 }]

function renderizarFormulario(overrides = {}) {
  return render(
    <TransacaoForm
      pessoas={pessoas}
      pessoasCarregando={false}
      pessoasErro={null}
      transacoesCarregando={false}
      transacoesCarregadasComSucesso={true}
      onTransacaoCriada={vi.fn()}
      onPessoaInvalida={vi.fn()}
      {...overrides}
    />,
  )
}

function criarRespostaJson(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

describe('TransacaoForm', () => {
  it('envia valor com vírgula como número no corpo JSON', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn().mockResolvedValue(
      criarRespostaJson({ id: 10, descricao: 'Mercado', valor: 10.5, tipo: 0, pessoaId: 1 }, 201),
    )
    const onTransacaoCriada = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    renderizarFormulario({ onTransacaoCriada })

    await user.type(screen.getByLabelText('Descrição'), 'Mercado')
    await user.type(screen.getByLabelText('Valor'), '10,50')
    await user.selectOptions(screen.getByLabelText('Tipo'), '0')
    await user.selectOptions(screen.getByLabelText('Pessoa'), '1')
    await user.click(screen.getByRole('button', { name: 'Cadastrar transação' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled()
    })

    const [, options] = fetchMock.mock.calls[0]
    expect(JSON.parse(options.body)).toEqual({ descricao: 'Mercado', valor: 10.5, tipo: 0, pessoaId: 1 })
    expect(onTransacaoCriada).toHaveBeenCalledWith({ id: 10, descricao: 'Mercado', valor: 10.5, tipo: 0, pessoaId: 1 })
  })

  it('mostra erro de receita para menor e preserva os campos', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn().mockResolvedValue(
      criarRespostaJson({ codigo: 'receita_nao_permitida_para_menor_de_idade' }, 400),
    )
    vi.stubGlobal('fetch', fetchMock)

    renderizarFormulario()

    await user.type(screen.getByLabelText('Descrição'), 'Mesada')
    await user.type(screen.getByLabelText('Valor'), '100')
    await user.selectOptions(screen.getByLabelText('Tipo'), '1')
    await user.selectOptions(screen.getByLabelText('Pessoa'), '1')
    await user.click(screen.getByRole('button', { name: 'Cadastrar transação' }))

    expect(await screen.findByText('Pessoas menores de idade só podem cadastrar despesas.')).toBeTruthy()
    expect((screen.getByLabelText('Descrição') as HTMLInputElement).value).toBe('Mesada')
    expect((screen.getByLabelText('Valor') as HTMLInputElement).value).toBe('100')
    expect((screen.getByLabelText('Tipo') as HTMLSelectElement).value).toBe('1')
    expect((screen.getByLabelText('Pessoa') as HTMLSelectElement).value).toBe('1')
  })
})
