export type TotalPorPessoa = {
  pessoaId: number
  nome: string
  totalReceitas: number
  totalDespesas: number
  saldo: number
}

export type TotalGeral = {
  totalReceitas: number
  totalDespesas: number
  saldo: number
}

export type Totais = {
  totaisPorPessoa: TotalPorPessoa[]
  totalGeral: TotalGeral
}
