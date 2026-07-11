import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PessoaForm } from './PessoaForm'

function criarRespostaJson(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

describe('PessoaForm', () => {
  it('mostra erros para dados locais inválidos e não executa fetch', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn()
    const onPessoaCriada = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    render(<PessoaForm onPessoaCriada={onPessoaCriada} />)

    await user.click(screen.getByRole('button', { name: 'Cadastrar pessoa' }))

    expect(screen.getByText('Informe o nome.')).toBeTruthy()
    expect(screen.getByText('Informe a idade.')).toBeTruthy()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(onPessoaCriada).not.toHaveBeenCalled()
  })

  it('chama onPessoaCriada e limpa os campos quando a API retorna 201', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn().mockResolvedValue(criarRespostaJson({ id: 1, nome: 'Maria', idade: 32 }, 201))
    const onPessoaCriada = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    render(<PessoaForm onPessoaCriada={onPessoaCriada} />)

    await user.type(screen.getByLabelText('Nome'), 'Maria')
    await user.type(screen.getByLabelText('Idade'), '32')
    await user.click(screen.getByRole('button', { name: 'Cadastrar pessoa' }))

    await waitFor(() => {
      expect(onPessoaCriada).toHaveBeenCalledWith({ id: 1, nome: 'Maria', idade: 32 })
    })

    expect((screen.getByLabelText('Nome') as HTMLInputElement).value).toBe('')
    expect((screen.getByLabelText('Idade') as HTMLInputElement).value).toBe('')
  })
})
