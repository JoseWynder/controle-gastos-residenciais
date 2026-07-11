import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { Pessoa } from '../types/pessoa'
import type { TipoTransacao, Transacao } from '../types/transacao'
import {
  criarTransacao,
  ErroPessoaTransacaoNaoEncontrada,
  ErroReceitaNaoPermitidaParaMenor,
  ErroValidacaoTransacao,
} from '../services/transacoesApi'

type TransacaoFormProps = {
  pessoas: Pessoa[]
  pessoasCarregando: boolean
  pessoasErro: string | null
  transacoesCarregando: boolean
  transacoesCarregadasComSucesso: boolean
  onTransacaoCriada: (transacao: Transacao) => void
  onPessoaInvalida: (pessoaId: number) => void
}

type TipoCampo = '' | '0' | '1'

type ErrosFormulario = {
  descricao?: string
  valor?: string
  tipo?: string
  pessoaId?: string
}

const mensagemErroGeral = 'Não foi possível cadastrar a transação. Verifique se a API está em execução.'
const mensagemPessoaNaoEncontrada = 'A pessoa selecionada já não está disponível. Escolha outra pessoa.'
const mensagemReceitaMenor = 'Pessoas menores de idade só podem cadastrar despesas.'
const valorDecimalSimplesRegex = /^\d+([,.]\d+)?$/

function obterPrimeiraMensagem(errors: Record<string, string[]>, campo: string) {
  return errors[campo]?.[0]
}

function converterValor(valor: string) {
  const valorTratado = valor.trim()

  if (!valorTratado) {
    return { erro: 'Informe o valor.' }
  }

  if (!valorDecimalSimplesRegex.test(valorTratado)) {
    return { erro: 'Informe um valor positivo usando apenas vírgula ou ponto como separador decimal.' }
  }

  const valorConvertido = Number(valorTratado.replace(',', '.'))

  if (!Number.isFinite(valorConvertido) || valorConvertido <= 0) {
    return { erro: 'O valor deve ser maior que zero.' }
  }

  return { valor: valorConvertido }
}

function validarFormulario(descricao: string, valor: string, tipo: TipoCampo, pessoaId: string) {
  const erros: ErrosFormulario = {}
  const descricaoTratada = descricao.trim()
  const valorConvertido = converterValor(valor)
  const pessoaIdConvertido = Number(pessoaId)

  if (!descricaoTratada) {
    erros.descricao = 'Informe a descrição.'
  } else if (descricaoTratada.length > 100) {
    erros.descricao = 'A descrição deve ter no máximo 100 caracteres.'
  }

  if (valorConvertido.erro) {
    erros.valor = valorConvertido.erro
  }

  if (tipo !== '0' && tipo !== '1') {
    erros.tipo = 'Informe o tipo da transação.'
  }

  if (!pessoaId || !Number.isInteger(pessoaIdConvertido) || pessoaIdConvertido <= 0) {
    erros.pessoaId = 'Informe a pessoa.'
  }

  if (Object.keys(erros).length > 0) {
    return { erros }
  }

  return {
    erros,
    payload: {
      descricao: descricaoTratada,
      valor: valorConvertido.valor!,
      tipo: Number(tipo) as TipoTransacao,
      pessoaId: pessoaIdConvertido,
    },
  }
}

export function TransacaoForm({
  pessoas,
  pessoasCarregando,
  pessoasErro,
  transacoesCarregando,
  transacoesCarregadasComSucesso,
  onTransacaoCriada,
  onPessoaInvalida,
}: TransacaoFormProps) {
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [tipo, setTipo] = useState<TipoCampo>('')
  const [pessoaId, setPessoaId] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erros, setErros] = useState<ErrosFormulario>({})
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const envioEmAndamento = useRef(false)

  const formularioDisponivel =
    transacoesCarregadasComSucesso && !transacoesCarregando && !pessoasCarregando && !pessoasErro && pessoas.length > 0
  const formularioBloqueado = !formularioDisponivel || enviando

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!formularioDisponivel || envioEmAndamento.current) {
      return
    }

    const resultadoValidacao = validarFormulario(descricao, valor, tipo, pessoaId)

    if (Object.keys(resultadoValidacao.erros).length > 0 || !resultadoValidacao.payload) {
      setErros(resultadoValidacao.erros)
      setErroGeral(null)
      return
    }

    try {
      envioEmAndamento.current = true
      setEnviando(true)
      setErros({})
      setErroGeral(null)

      const transacaoCriada = await criarTransacao(resultadoValidacao.payload)

      onTransacaoCriada(transacaoCriada)
      setDescricao('')
      setValor('')
      setTipo('')
      setPessoaId('')
      setErros({})
      setErroGeral(null)
    } catch (error) {
      if (error instanceof ErroValidacaoTransacao) {
        setErros({
          descricao: obterPrimeiraMensagem(error.errors, 'descricao'),
          valor: obterPrimeiraMensagem(error.errors, 'valor'),
          tipo: obterPrimeiraMensagem(error.errors, 'tipo'),
          pessoaId: obterPrimeiraMensagem(error.errors, 'pessoaid'),
        })
        setErroGeral(null)
      } else if (error instanceof ErroPessoaTransacaoNaoEncontrada) {
        onPessoaInvalida(error.pessoaId)
        setPessoaId('')
        setErroGeral(mensagemPessoaNaoEncontrada)
      } else if (error instanceof ErroReceitaNaoPermitidaParaMenor) {
        setErroGeral(mensagemReceitaMenor)
      } else {
        setErroGeral(mensagemErroGeral)
      }
    } finally {
      envioEmAndamento.current = false
      setEnviando(false)
    }
  }

  return (
    <form className="transaction-form" noValidate onSubmit={handleSubmit}>
      {!transacoesCarregadasComSucesso && !transacoesCarregando && (
        <p className="status-message">Carregue as transações antes de cadastrar uma nova.</p>
      )}
      {pessoas.length === 0 && !pessoasCarregando && !pessoasErro && (
        <p className="status-message">Cadastre uma pessoa antes de registrar uma transação.</p>
      )}

      <div className="form-field">
        <label htmlFor="descricao-transacao">Descrição</label>
        <input
          id="descricao-transacao"
          name="descricao"
          type="text"
          maxLength={100}
          value={descricao}
          disabled={formularioBloqueado}
          aria-invalid={Boolean(erros.descricao)}
          aria-describedby={erros.descricao ? 'descricao-transacao-error' : undefined}
          onChange={(event) => setDescricao(event.target.value)}
        />
        {erros.descricao && (
          <span className="field-error" id="descricao-transacao-error">
            {erros.descricao}
          </span>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="valor-transacao">Valor</label>
        <input
          id="valor-transacao"
          name="valor"
          type="text"
          inputMode="decimal"
          value={valor}
          disabled={formularioBloqueado}
          aria-invalid={Boolean(erros.valor)}
          aria-describedby={erros.valor ? 'valor-transacao-error' : undefined}
          onChange={(event) => setValor(event.target.value)}
        />
        {erros.valor && (
          <span className="field-error" id="valor-transacao-error">
            {erros.valor}
          </span>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="tipo-transacao">Tipo</label>
        <select
          id="tipo-transacao"
          name="tipo"
          value={tipo}
          disabled={formularioBloqueado}
          aria-invalid={Boolean(erros.tipo)}
          aria-describedby={erros.tipo ? 'tipo-transacao-error' : undefined}
          onChange={(event) => setTipo(event.target.value as TipoCampo)}
        >
          <option value="">Selecione o tipo</option>
          <option value="0">Despesa</option>
          <option value="1">Receita</option>
        </select>
        {erros.tipo && (
          <span className="field-error" id="tipo-transacao-error">
            {erros.tipo}
          </span>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="pessoa-transacao">Pessoa</label>
        <select
          id="pessoa-transacao"
          name="pessoaId"
          value={pessoaId}
          disabled={formularioBloqueado}
          aria-invalid={Boolean(erros.pessoaId)}
          aria-describedby={erros.pessoaId ? 'pessoa-transacao-error' : undefined}
          onChange={(event) => setPessoaId(event.target.value)}
        >
          <option value="">Selecione a pessoa</option>
          {pessoas.map((pessoa) => (
            <option value={pessoa.id} key={pessoa.id}>
              {pessoa.nome}
            </option>
          ))}
        </select>
        {erros.pessoaId && (
          <span className="field-error" id="pessoa-transacao-error">
            {erros.pessoaId}
          </span>
        )}
      </div>

      {erroGeral && <p className="status-message error-message">{erroGeral}</p>}

      <button type="submit" disabled={formularioBloqueado}>
        {enviando ? 'Cadastrando...' : 'Cadastrar transação'}
      </button>
    </form>
  )
}