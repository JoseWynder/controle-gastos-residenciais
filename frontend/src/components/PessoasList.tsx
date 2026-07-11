import type { Pessoa } from '../types/pessoa'

type PessoasListProps = {
  pessoas: Pessoa[]
  carregando: boolean
  erro: string | null
}

export function PessoasList({ pessoas, carregando, erro }: PessoasListProps) {
  if (carregando) {
    return <p className="status-message">Carregando pessoas...</p>
  }

  if (erro) {
    return <p className="status-message error-message">{erro}</p>
  }

  if (pessoas.length === 0) {
    return <p className="status-message">Nenhuma pessoa cadastrada.</p>
  }

  return (
    <ul className="people-list" aria-label="Pessoas cadastradas">
      {pessoas.map((pessoa) => (
        <li className="person-item" key={pessoa.id}>
          <strong>{pessoa.nome}</strong>
          <span>{pessoa.idade} anos</span>
        </li>
      ))}
    </ul>
  )
}