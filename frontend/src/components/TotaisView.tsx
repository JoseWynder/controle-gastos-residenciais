import type { TotalGeral, TotalPorPessoa, Totais } from '../types/totais'

type TotaisViewProps = {
  totais: Totais | null
  carregando: boolean
  erro: string | null
}

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

function obterClasseSaldo(valor: number) {
  if (valor > 0) {
    return 'positive'
  }

  if (valor < 0) {
    return 'negative'
  }

  return 'neutral'
}

function TotaisLinha({ label, valor, tipo }: { label: string; valor: number; tipo: 'income' | 'expense' | 'balance' }) {
  const classeValor = tipo === 'balance' ? obterClasseSaldo(valor) : tipo

  return (
    <div className="total-row">
      <span>{label}</span>
      <strong className={`total-value ${classeValor}`}>{formatadorMoeda.format(valor)}</strong>
    </div>
  )
}

function TotalGeralResumo({ totalGeral }: { totalGeral: TotalGeral }) {
  return (
    <section className="totals-summary" aria-labelledby="total-geral-title">
      <h3 id="total-geral-title">Total geral</h3>
      <TotaisLinha label="Receitas" valor={totalGeral.totalReceitas} tipo="income" />
      <TotaisLinha label="Despesas" valor={totalGeral.totalDespesas} tipo="expense" />
      <TotaisLinha label="Saldo líquido" valor={totalGeral.saldo} tipo="balance" />
    </section>
  )
}

function TotalPessoaItem({ total }: { total: TotalPorPessoa }) {
  return (
    <li className="total-person-item">
      <h3>{total.nome}</h3>
      <TotaisLinha label="Receitas" valor={total.totalReceitas} tipo="income" />
      <TotaisLinha label="Despesas" valor={total.totalDespesas} tipo="expense" />
      <TotaisLinha label="Saldo" valor={total.saldo} tipo="balance" />
    </li>
  )
}

export function TotaisView({ totais, carregando, erro }: TotaisViewProps) {
  if (carregando) {
    return <p className="status-message">Carregando totais...</p>
  }

  if (erro) {
    return <p className="status-message error-message">{erro}</p>
  }

  if (!totais) {
    return null
  }

  return (
    <div className="totals-view">
      <TotalGeralResumo totalGeral={totais.totalGeral} />

      <section aria-labelledby="totais-pessoas-title">
        <h3 id="totais-pessoas-title">Totais por pessoa</h3>

        {totais.totaisPorPessoa.length === 0 ? (
          <p className="status-message">Nenhuma pessoa cadastrada.</p>
        ) : (
          <ul className="totals-person-list" aria-label="Totais por pessoa">
            {totais.totaisPorPessoa.map((total) => (
              <TotalPessoaItem total={total} key={total.pessoaId} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
