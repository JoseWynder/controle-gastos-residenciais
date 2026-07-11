import { useEffect, useRef, useState } from 'react'
import './App.css'
import { PessoaForm } from './components/PessoaForm'
import { PessoasList } from './components/PessoasList'
import { TotaisView } from './components/TotaisView'
import { TransacaoForm } from './components/TransacaoForm'
import { TransacoesList } from './components/TransacoesList'
import { deletarPessoa, ErroPessoaNaoEncontrada, listarPessoas } from './services/pessoasApi'
import { obterTotais } from './services/totaisApi'
import { listarTransacoes } from './services/transacoesApi'
import type { Pessoa } from './types/pessoa'
import type { Totais } from './types/totais'
import type { Transacao } from './types/transacao'

const mensagemErroListagem = 'Não foi possível carregar as pessoas. Verifique se a API está em execução.'
const mensagemErroExclusao = 'Não foi possível excluir a pessoa. Verifique se a API está em execução.'
const mensagemPessoaNaoEncontrada = 'A pessoa já não estava disponível e foi removida da listagem.'
const mensagemErroTransacoes = 'Não foi possível carregar as transações. Verifique se a API está em execução.'
const mensagemErroTotais = 'Não foi possível carregar os totais. Verifique se a API está em execução.'

type AbaAtiva = 'pessoas' | 'transacoes' | 'totais'

function App() {
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>('pessoas')
  const [pessoas, setPessoas] = useState<Pessoa[]>([])
  const [carregandoPessoas, setCarregandoPessoas] = useState(true)
  const [erroListagem, setErroListagem] = useState<string | null>(null)
  const [pessoaExcluindoId, setPessoaExcluindoId] = useState<number | null>(null)
  const [erroExclusao, setErroExclusao] = useState<string | null>(null)
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [carregandoTransacoes, setCarregandoTransacoes] = useState(false)
  const [erroTransacoes, setErroTransacoes] = useState<string | null>(null)
  const [transacoesCarregadasComSucesso, setTransacoesCarregadasComSucesso] = useState(false)
  const [totais, setTotais] = useState<Totais | null>(null)
  const [carregandoTotais, setCarregandoTotais] = useState(false)
  const [erroTotais, setErroTotais] = useState<string | null>(null)
  const cargaTransacoesEmAndamento = useRef(false)
  const cargaTotaisId = useRef(0)

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

  useEffect(() => {
    if (abaAtiva !== 'transacoes' || transacoesCarregadasComSucesso || cargaTransacoesEmAndamento.current) {
      return
    }

    const controller = new AbortController()

    async function carregarTransacoes() {
      try {
        cargaTransacoesEmAndamento.current = true
        setCarregandoTransacoes(true)
        setErroTransacoes(null)
        const transacoesCarregadas = await listarTransacoes(controller.signal)

        if (controller.signal.aborted) {
          return
        }

        setTransacoes(transacoesCarregadas)
        setTransacoesCarregadasComSucesso(true)
      } catch {
        if (controller.signal.aborted) {
          return
        }

        setErroTransacoes(mensagemErroTransacoes)
      } finally {
        if (!controller.signal.aborted) {
          cargaTransacoesEmAndamento.current = false
          setCarregandoTransacoes(false)
        }
      }
    }

    void carregarTransacoes()

    return () => {
      controller.abort()
      cargaTransacoesEmAndamento.current = false
    }
  }, [abaAtiva, transacoesCarregadasComSucesso])

  useEffect(() => {
    if (abaAtiva !== 'totais') {
      return
    }

    const controller = new AbortController()
    const cargaAtualId = cargaTotaisId.current + 1
    cargaTotaisId.current = cargaAtualId

    async function carregarTotais() {
      try {
        setCarregandoTotais(true)
        setErroTotais(null)
        setTotais(null)

        const totaisCarregados = await obterTotais(controller.signal)

        if (controller.signal.aborted || cargaTotaisId.current !== cargaAtualId) {
          return
        }

        setTotais(totaisCarregados)
      } catch {
        if (controller.signal.aborted || cargaTotaisId.current !== cargaAtualId) {
          return
        }

        setErroTotais(mensagemErroTotais)
        setTotais(null)
      } finally {
        if (!controller.signal.aborted && cargaTotaisId.current === cargaAtualId) {
          setCarregandoTotais(false)
        }
      }
    }

    void carregarTotais()

    return () => {
      controller.abort()
    }
  }, [abaAtiva])

  function handlePessoaCriada(pessoa: Pessoa) {
    setPessoas((pessoasAtuais) => [...pessoasAtuais, pessoa])
    setErroListagem(null)
  }

  function handleTransacaoCriada(transacao: Transacao) {
    setTransacoes((transacoesAtuais) => [...transacoesAtuais, transacao])
    setErroTransacoes(null)
  }

  function removerPessoaETransacoesRelacionadas(id: number) {
    setPessoas((pessoasAtuais) => pessoasAtuais.filter((pessoa) => pessoa.id !== id))
    setTransacoes((transacoesAtuais) => transacoesAtuais.filter((transacao) => transacao.pessoaId !== id))
  }

  async function handleExcluirPessoa(id: number) {
    if (pessoaExcluindoId !== null) {
      return
    }

    try {
      setErroExclusao(null)
      setPessoaExcluindoId(id)
      await deletarPessoa(id)
      removerPessoaETransacoesRelacionadas(id)
      setErroExclusao(null)
    } catch (error) {
      if (error instanceof ErroPessoaNaoEncontrada) {
        removerPessoaETransacoesRelacionadas(id)
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
        <p className="eyebrow">Controle</p>
        <h1 id="app-title">Controle de Gastos Residenciais</h1>
        <p className="support">Cadastre pessoas e acompanhe as transações registradas na API.</p>
      </section>

      <div className="tabs" aria-label="Áreas do sistema">
        <button
          className={`tab-button ${abaAtiva === 'pessoas' ? 'active' : ''}`}
          type="button"
          aria-pressed={abaAtiva === 'pessoas'}
          onClick={() => setAbaAtiva('pessoas')}
        >
          Pessoas
        </button>
        <button
          className={`tab-button ${abaAtiva === 'transacoes' ? 'active' : ''}`}
          type="button"
          aria-pressed={abaAtiva === 'transacoes'}
          onClick={() => setAbaAtiva('transacoes')}
        >
          Transações
        </button>
        <button
          className={`tab-button ${abaAtiva === 'totais' ? 'active' : ''}`}
          type="button"
          aria-pressed={abaAtiva === 'totais'}
          onClick={() => setAbaAtiva('totais')}
        >
          Totais
        </button>
      </div>

      {abaAtiva === 'pessoas' && (
        <>
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
        </>
      )}

      {abaAtiva === 'transacoes' && (
        <>
          <section className="people-section" aria-labelledby="transaction-form-title">
            <h2 id="transaction-form-title">Cadastrar transação</h2>
            <TransacaoForm
              pessoas={pessoas}
              pessoasCarregando={carregandoPessoas}
              pessoasErro={erroListagem}
              transacoesCarregando={carregandoTransacoes}
              transacoesCarregadasComSucesso={transacoesCarregadasComSucesso}
              onTransacaoCriada={handleTransacaoCriada}
              onPessoaInvalida={removerPessoaETransacoesRelacionadas}
            />
          </section>

          <section className="people-section" aria-labelledby="transactions-title">
            <h2 id="transactions-title">Transações cadastradas</h2>
            <TransacoesList
              transacoes={transacoes}
              pessoas={pessoas}
              carregando={carregandoTransacoes}
              erro={erroTransacoes}
            />
          </section>
        </>
      )}

      {abaAtiva === 'totais' && (
        <section className="people-section" aria-labelledby="totals-title">
          <h2 id="totals-title">Totais</h2>
          <TotaisView totais={totais} carregando={carregandoTotais} erro={erroTotais} />
        </section>
      )}
    </main>
  )
}

export default App
