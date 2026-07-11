import type { Transacao } from '../types/transacao'

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

export async function listarTransacoes(signal?: AbortSignal): Promise<Transacao[]> {
  const url = criarUrl('/api/transacoes')
  const response = await fetch(url, { signal })

  if (!response.ok) {
    throw new Error('Não foi possível carregar as transações.')
  }

  return (await response.json()) as Transacao[]
}