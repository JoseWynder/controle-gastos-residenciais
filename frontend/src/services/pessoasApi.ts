import type { CriarPessoaPayload, Pessoa } from '../types/pessoa'

type ValidationProblemDetails = {
  errors?: Record<string, string[]>
}

export class ErroValidacaoPessoa extends Error {
  errors: Record<string, string[]>

  constructor(errors: Record<string, string[]>) {
    super('Dados inválidos.')
    this.name = 'ErroValidacaoPessoa'
    this.errors = errors
  }
}

export class ErroPessoaNaoEncontrada extends Error {
  constructor() {
    super('Pessoa não encontrada.')
    this.name = 'ErroPessoaNaoEncontrada'
  }
}

function obterApiUrl() {
  const apiUrl = import.meta.env.VITE_API_URL?.trim()

  if (!apiUrl) {
    throw new Error('VITE_API_URL não configurada.')
  }

  return apiUrl
}

function criarUrl(path: string) {
  return new URL(path, obterApiUrl())
}

function normalizarErrosValidacao(errors: Record<string, string[]> = {}) {
  return Object.entries(errors).reduce<Record<string, string[]>>((resultado, [campo, mensagens]) => {
    resultado[campo.toLowerCase()] = mensagens
    return resultado
  }, {})
}

export async function listarPessoas(signal?: AbortSignal): Promise<Pessoa[]> {
  const url = criarUrl('/api/pessoas')
  const response = await fetch(url, { signal })

  if (!response.ok) {
    throw new Error('Não foi possível carregar as pessoas.')
  }

  return (await response.json()) as Pessoa[]
}

export async function criarPessoa(payload: CriarPessoaPayload): Promise<Pessoa> {
  const url = criarUrl('/api/pessoas')
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (response.status === 201) {
    return (await response.json()) as Pessoa
  }

  if (response.status === 400) {
    const problemDetails = (await response.json()) as ValidationProblemDetails
    throw new ErroValidacaoPessoa(normalizarErrosValidacao(problemDetails.errors))
  }

  throw new Error('Não foi possível cadastrar a pessoa.')
}

export async function deletarPessoa(id: number): Promise<void> {
  const url = criarUrl(`/api/pessoas/${id}`)
  const response = await fetch(url, {
    method: 'DELETE',
  })

  if (response.status === 204) {
    return
  }

  if (response.status === 404) {
    throw new ErroPessoaNaoEncontrada()
  }

  throw new Error('Não foi possível excluir a pessoa.')
}