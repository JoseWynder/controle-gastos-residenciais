import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TotaisView } from './TotaisView'

describe('TotaisView', () => {
  it('mostra mensagem de ausência e total geral zerado quando não há pessoas', () => {
    render(
      <TotaisView
        carregando={false}
        erro={null}
        totais={{
          totaisPorPessoa: [],
          totalGeral: { totalReceitas: 0, totalDespesas: 0, saldo: 0 },
        }}
      />,
    )

    expect(screen.getByText('Nenhuma pessoa cadastrada.')).toBeTruthy()
    expect(screen.getByText('Total geral')).toBeTruthy()
    expect(document.body.textContent).toContain('0,00')
  })

  it('mostra totais por pessoa e total geral formatados em BRL', () => {
    render(
      <TotaisView
        carregando={false}
        erro={null}
        totais={{
          totaisPorPessoa: [
            { pessoaId: 1, nome: 'Maria', totalReceitas: 100, totalDespesas: 40, saldo: 60 },
          ],
          totalGeral: { totalReceitas: 100, totalDespesas: 40, saldo: 60 },
        }}
      />,
    )

    expect(screen.getByText('Maria')).toBeTruthy()
    expect(screen.getByText('Total geral')).toBeTruthy()
    expect(document.body.textContent).toContain('100,00')
    expect(document.body.textContent).toContain('40,00')
    expect(document.body.textContent).toContain('60,00')
  })
})
