import { useEffect, useState } from 'react'
import './App.css'
import { PessoaForm } from './components/PessoaForm'
import { PessoasList } from './components/PessoasList'
import { deletarPessoa, ErroPessoaNaoEncontrada, listarPessoas } from './services/pessoasApi'
import type { Pessoa } from './types/pessoa'

const mensagemErroListagem = 'Não foi possível carregar as pessoas. Verifique se a API está em execução.'
const mensagemErroExclusao = 'Não foi possível excluir a pessoa. Verifique se a API está em execução.'
const mensagemPessoaNaoEncontrada = 'A pessoa já não estava disponível e foi removida da listagem.'

function App() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([])
  const [carregandoPessoas, setCarregandoPessoas] = useState(true)
  const [erroListagem, setErroListagem] = useState<string | null>(null)
  const [pessoaExcluindoId, setPessoaExcluindoId] = useState<number | null>(null)
  const [erroExclusao, setErroExclusao] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function carregarPessoas() {
      try {
        setCarregandoPessoas(true)
        setErroListagem(null)
        const pessoasCarregadas = await listarPessoas(controller.signal)
        setPessoas(pessoasCarregadas)
      } catch {
        if (controller.signal.aborted) {
          return
        }

        setErroListagem(mensagemErroListagem)
        setPessoas([])
      } finally {
        if (!controller.signal.aborted) {
          setCarregandoPessoas(false)
        }
      }
    }

    void carregarPessoas()

    return () => {
      controller.abort()
    }
  }, [])

  function handlePessoaCriada(pessoa: Pessoa) {
    setPessoas((pessoasAtuais) => [...pessoasAtuais, pessoa])
    setErroListagem(null)
  }

  async function handleExcluirPessoa(id: number) {
    if (pessoaExcluindoId !== null) {
      return
    }

    try {
      setErroExclusao(null)
      setPessoaExcluindoId(id)
      await deletarPessoa(id)
      setPessoas((pessoasAtuais) => pessoasAtuais.filter((pessoa) => pessoa.id !== id))
      setErroExclusao(null)
    } catch (error) {
      if (error instanceof ErroPessoaNaoEncontrada) {
        setPessoas((pessoasAtuais) => pessoasAtuais.filter((pessoa) => pessoa.id !== id))
        setErroExclusao(mensagemPessoaNaoEncontrada)
      } else {
        setErroExclusao(mensagemErroExclusao)
      }
    } finally {
      setPessoaExcluindoId(null)
    }
  }

  return (
    <main className="app-shell">
      <section className="intro" aria-labelledby="app-title">
        <p className="eyebrow">Pessoas</p>
        <h1 id="app-title">Controle de Gastos Residenciais</h1>
        <p className="support">Cadastre e acompanhe as pessoas disponíveis na API.</p>
      </section>

      <section className="people-section" aria-labelledby="form-title">
        <h2 id="form-title">Cadastrar pessoa</h2>
        <PessoaForm disabled={carregandoPessoas} onPessoaCriada={handlePessoaCriada} />
      </section>

      <section className="people-section" aria-labelledby="people-title">
        <h2 id="people-title">Pessoas cadastradas</h2>
        {erroExclusao && <p className="status-message error-message">{erroExclusao}</p>}
        <PessoasList
          pessoas={pessoas}
          carregando={carregandoPessoas}
          erro={erroListagem}
          pessoaExcluindoId={pessoaExcluindoId}
          onExcluirPessoa={handleExcluirPessoa}
        />
      </section>
    </main>
  )
}

export default App