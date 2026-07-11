import type { Totais } from '../types/totais'

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

export async function obterTotais(signal?: AbortSignal): Promise<Totais> {
  const url = criarUrl('/api/totais')
  const response = await fetch(url, { signal })

  if (!response.ok) {
    throw new Error('Não foi possível carregar os totais.')
  }

  return (await response.json()) as Totais
}
