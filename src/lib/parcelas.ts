import type { Bill } from '../types'
import { getCurrentMonth, parseYM } from './dates'

export function monthsBetween(fromYm: string, toYm: string) {
  const a = parseYM(fromYm)
  const b = parseYM(toYm)
  return (b.ano - a.ano) * 12 + (b.mes - a.mes)
}

export function parcelaNoMes(bill: Bill, ym: string): number | null {
  if (bill.tipo !== 'parcelada' || !bill.parcelas || bill.parcela_atual == null) return null
  const inicio = bill.created_at.slice(0, 7)
  const diff = monthsBetween(inicio, ym)
  if (diff < 0) return null
  const n = bill.parcela_atual + diff
  if (n < 1 || n > bill.parcelas) return null
  return n
}

export function rebaseParcelaAtual(parcelaInformada: number, createdAt: string) {
  return parcelaInformada - monthsBetween(createdAt.slice(0, 7), getCurrentMonth())
}

export function contaAtivaNoMes(bill: Bill, ym: string): boolean {
  if (monthsBetween(bill.created_at.slice(0, 7), ym) < 0) return false
  if (bill.tipo !== 'parcelada' || !bill.parcelas || bill.parcela_atual == null) return true
  return parcelaNoMes(bill, ym) !== null
}
