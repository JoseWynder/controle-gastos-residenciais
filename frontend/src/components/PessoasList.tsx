import type { Pessoa } from '../types/pessoa'

type PessoasListProps = {
  pessoas: Pessoa[]
  carregando: boolean
  erro: string | null
  pessoaExcluindoId: number | null
  onExcluirPessoa: (id: number) => void
}

export function PessoasList({ pessoas, carregando, erro, pessoaExcluindoId, onExcluirPessoa }: PessoasListProps) {
  if (carregando) {
    return <p className="status-message" role="status">Carregando pessoas...</p>
  }

  if (erro) {
    return <p className="status-message error-message" role="alert">{erro}</p>
  }

  if (pessoas.length === 0) {
    return <p className="status-message" role="status">Nenhuma pessoa cadastrada.</p>
  }

  function handleExcluirPessoa(pessoa: Pessoa) {
    const confirmou = window.confirm(
      `Deseja excluir ${pessoa.nome}? As transações relacionadas também serão removidas.`,
    )

    if (!confirmou) {
      return
    }

    onExcluirPessoa(pessoa.id)
  }

  return (
    <ul className="people-list" aria-label="Pessoas cadastradas">
      {pessoas.map((pessoa) => {
        const estaExcluindo = pessoaExcluindoId === pessoa.id
        const exclusaoEmAndamento = pessoaExcluindoId !== null

        return (
          <li className="person-item" key={pessoa.id}>
            <div className="person-info">
              <strong>{pessoa.nome}</strong>
              <span>{pessoa.idade} anos</span>
            </div>

            <button
              className="delete-button"
              type="button"
              disabled={exclusaoEmAndamento}
              aria-label={`${estaExcluindo ? 'Excluindo' : 'Excluir'} ${pessoa.nome}`}
              onClick={() => handleExcluirPessoa(pessoa)}
            >
              {estaExcluindo ? 'Excluindo...' : 'Excluir'}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

