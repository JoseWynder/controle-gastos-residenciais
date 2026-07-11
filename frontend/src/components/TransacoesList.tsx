import type { Pessoa } from '../types/pessoa'
import type { TipoTransacao, Transacao } from '../types/transacao'

type TransacoesListProps = {
  transacoes: Transacao[]
  pessoas: Pessoa[]
  carregando: boolean
  erro: string | null
}

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

function obterDescricaoTipo(tipo: TipoTransacao) {
  return tipo === 1 ? 'Receita' : 'Despesa'
}

export function TransacoesList({ transacoes, pessoas, carregando, erro }: TransacoesListProps) {
  if (carregando) {
    return <p className="status-message" role="status">Carregando transações...</p>
  }

  if (erro) {
    return <p className="status-message error-message" role="alert">{erro}</p>
  }

  if (transacoes.length === 0) {
    return <p className="status-message" role="status">Nenhuma transação cadastrada.</p>
  }

  const pessoasPorId = new Map(pessoas.map((pessoa) => [pessoa.id, pessoa.nome]))

  return (
    <ul className="transactions-list" aria-label="Transações cadastradas">
      {transacoes.map((transacao) => {
        const tipo = obterDescricaoTipo(transacao.tipo)
        const nomePessoa = pessoasPorId.get(transacao.pessoaId) ?? `Pessoa #${transacao.pessoaId}`

        return (
          <li className="transaction-item" key={transacao.id}>
            <div className="transaction-main">
              <strong>{transacao.descricao}</strong>
              <span>{nomePessoa}</span>
            </div>

            <div className="transaction-details">
              <span className={`transaction-type ${transacao.tipo === 1 ? 'income' : 'expense'}`}>{tipo}</span>
              <span>{formatadorMoeda.format(transacao.valor)}</span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
