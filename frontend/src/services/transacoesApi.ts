import type { CriarTransacaoPayload, Transacao } from '../types/transacao'

type ProblemDetails = {
  codigo?: string
  detail?: string
  errors?: Record<string, string[]>
}

export class ErroValidacaoTransacao extends Error {
  errors: Record<string, string[]>

  constructor(errors: Record<string, string[]>) {
    super('Dados inválidos.')
    this.name = 'ErroValidacaoTransacao'
    this.errors = errors
  }
}

export class ErroPessoaTransacaoNaoEncontrada extends Error {
  pessoaId: number

  constructor(pessoaId: number) {
    super('Pessoa não encontrada.')
    this.name = 'ErroPessoaTransacaoNaoEncontrada'
    this.pessoaId = pessoaId
  }
}

export class ErroReceitaNaoPermitidaParaMenor extends Error {
  constructor() {
    super('Pessoas menores de idade só podem cadastrar despesas.')
    this.name = 'ErroReceitaNaoPermitidaParaMenor'
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

async function lerProblemDetails(response: Response) {
  try {
    return (await response.json()) as ProblemDetails
  } catch {
    return {}
  }
}

export async function listarTransacoes(signal?: AbortSignal): Promise<Transacao[]> {
  const url = criarUrl('/api/transacoes')
  const response = await fetch(url, { signal })

  if (!response.ok) {
    throw new Error('Não foi possível carregar as transações.')
  }

  return (await response.json()) as Transacao[]
}

export async function criarTransacao(payload: CriarTransacaoPayload): Promise<Transacao> {
  const url = criarUrl('/api/transacoes')
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (response.status === 201) {
    return (await response.json()) as Transacao
  }

  if (response.status === 400) {
    const problemDetails = await lerProblemDetails(response)

    if (problemDetails.codigo === 'receita_nao_permitida_para_menor_de_idade') {
      throw new ErroReceitaNaoPermitidaParaMenor()
    }

    if (problemDetails.errors) {
      throw new ErroValidacaoTransacao(normalizarErrosValidacao(problemDetails.errors))
    }
  }

  if (response.status === 404) {
    const problemDetails = await lerProblemDetails(response)

    if (!problemDetails.codigo || problemDetails.codigo === 'pessoa_nao_encontrada') {
      throw new ErroPessoaTransacaoNaoEncontrada(payload.pessoaId)
    }
  }

  throw new Error('Não foi possível cadastrar a transação.')
}