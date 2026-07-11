import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PessoasList } from './PessoasList'

describe('PessoasList', () => {
  it('confirma a exclusão pelo nome acessível contextual e chama onExcluirPessoa com o id', async () => {
    const user = userEvent.setup()
    const onExcluirPessoa = vi.fn()
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(
      <PessoasList
        pessoas={[{ id: 7, nome: 'Maria', idade: 32 }]}
        carregando={false}
        erro={null}
        pessoaExcluindoId={null}
        onExcluirPessoa={onExcluirPessoa}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Excluir Maria' }))

    expect(window.confirm).toHaveBeenCalledWith(
      'Deseja excluir Maria? As transações relacionadas também serão removidas.',
    )
    expect(onExcluirPessoa).toHaveBeenCalledWith(7)
  })
})
