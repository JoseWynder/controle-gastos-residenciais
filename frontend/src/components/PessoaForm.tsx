import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { criarPessoa, ErroValidacaoPessoa } from '../services/pessoasApi'
import type { Pessoa } from '../types/pessoa'

type PessoaFormProps = {
  disabled?: boolean
  onPessoaCriada: (pessoa: Pessoa) => void
}

type ErrosFormulario = {
  nome?: string
  idade?: string
}

const mensagemErroGeral = 'Não foi possível cadastrar a pessoa. Verifique se a API está em execução.'

function validarFormulario(nome: string, idade: string) {
  const erros: ErrosFormulario = {}
  const nomeTratado = nome.trim()
  const idadeTratada = idade.trim()

  if (!nomeTratado) {
    erros.nome = 'Informe o nome.'
  }

  if (!idadeTratada) {
    erros.idade = 'Informe a idade.'
  } else {
    const idadeNumerica = Number(idadeTratada)

    if (Number.isNaN(idadeNumerica)) {
      erros.idade = 'Informe uma idade numérica.'
    } else if (!Number.isInteger(idadeNumerica)) {
      erros.idade = 'Informe uma idade inteira.'
    } else if (idadeNumerica < 0 || idadeNumerica > 130) {
      erros.idade = 'A idade deve estar entre 0 e 130 anos.'
    }
  }

  return erros
}

function obterPrimeiraMensagem(errors: Record<string, string[]>, campo: string) {
  return errors[campo]?.[0]
}

export function PessoaForm({ disabled = false, onPessoaCriada }: PessoaFormProps) {
  const [nome, setNome] = useState('')
  const [idade, setIdade] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erros, setErros] = useState<ErrosFormulario>({})
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const envioEmAndamento = useRef(false)

  const formularioBloqueado = disabled || enviando

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (disabled || envioEmAndamento.current) {
      return
    }

    const errosValidacao = validarFormulario(nome, idade)

    if (Object.keys(errosValidacao).length > 0) {
      setErros(errosValidacao)
      setErroGeral(null)
      return
    }

    try {
      envioEmAndamento.current = true
      setEnviando(true)
      setErros({})
      setErroGeral(null)

      const pessoaCriada = await criarPessoa({
        nome: nome.trim(),
        idade: Number(idade.trim()),
      })

      onPessoaCriada(pessoaCriada)
      setNome('')
      setIdade('')
      setErros({})
      setErroGeral(null)
    } catch (error) {
      if (error instanceof ErroValidacaoPessoa) {
        setErros({
          nome: obterPrimeiraMensagem(error.errors, 'nome'),
          idade: obterPrimeiraMensagem(error.errors, 'idade'),
        })
        setErroGeral(null)
      } else {
        setErroGeral(mensagemErroGeral)
      }
    } finally {
      envioEmAndamento.current = false
      setEnviando(false)
    }
  }

  return (
    <form className="person-form" noValidate onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="nome">Nome</label>
        <input
          id="nome"
          name="nome"
          type="text"
          value={nome}
          disabled={formularioBloqueado}
          aria-invalid={Boolean(erros.nome)}
          aria-describedby={erros.nome ? 'nome-error' : undefined}
          onChange={(event) => setNome(event.target.value)}
        />
        {erros.nome && (
          <span className="field-error" id="nome-error">
            {erros.nome}
          </span>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="idade">Idade</label>
        <input
          id="idade"
          name="idade"
          type="number"
          min="0"
          max="130"
          step="1"
          value={idade}
          disabled={formularioBloqueado}
          aria-invalid={Boolean(erros.idade)}
          aria-describedby={erros.idade ? 'idade-error' : undefined}
          onChange={(event) => setIdade(event.target.value)}
        />
        {erros.idade && (
          <span className="field-error" id="idade-error">
            {erros.idade}
          </span>
        )}
      </div>

      {erroGeral && <p className="status-message error-message">{erroGeral}</p>}

      <button type="submit" disabled={formularioBloqueado}>
        {enviando ? 'Cadastrando...' : 'Cadastrar pessoa'}
      </button>
    </form>
  )
}