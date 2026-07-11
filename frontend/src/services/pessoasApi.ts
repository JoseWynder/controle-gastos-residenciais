import type { Pessoa } from '../types/pessoa'

export async function listarPessoas(signal?: AbortSignal): Promise<Pessoa[]> {
  const apiUrl = import.meta.env.VITE_API_URL?.trim()

  if (!apiUrl) {
    throw new Error('VITE_API_URL não configurada.')
  }

  const url = new URL('/api/pessoas', apiUrl)
  const response = await fetch(url, { signal })

  if (!response.ok) {
    throw new Error('Não foi possível carregar as pessoas.')
  }

  return (await response.json()) as Pessoa[]
}