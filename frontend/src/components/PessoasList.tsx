import { useEffect, useState } from 'react'
import { listarPessoas } from '../services/pessoasApi'
import type { Pessoa } from '../types/pessoa'

const mensagemErro = 'Não foi possível carregar as pessoas. Verifique se a API está em execução.'

export function PessoasList() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function carregarPessoas() {
      try {
        setCarregando(true)
        setErro(null)
        const pessoasCarregadas = await listarPessoas(controller.signal)
        setPessoas(pessoasCarregadas)
      } catch {
        if (controller.signal.aborted) {
          return
        }

        setErro(mensagemErro)
        setPessoas([])
      } finally {
        if (!controller.signal.aborted) {
          setCarregando(false)
        }
      }
    }

    void carregarPessoas()

    return () => {
      controller.abort()
    }
  }, [])

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