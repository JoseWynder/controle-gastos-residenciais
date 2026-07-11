export type TipoTransacao = 0 | 1

export type Transacao = {
  id: number
  descricao: string
  valor: number
  tipo: TipoTransacao
  pessoaId: number
}

export type CriarTransacaoPayload = {
  descricao: string
  valor: number
  tipo: TipoTransacao
  pessoaId: number
}