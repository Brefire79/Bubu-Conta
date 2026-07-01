import { copy } from '../copy'

export function getCurrentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function parseYM(ym: string) {
  const [ano, mes] = ym.split('-').map(Number)
  return { ano, mes }
}

export function formatYM(ano: number, mes: number) {
  return `${ano}-${String(mes).padStart(2, '0')}`
}

export function nextMonth(ym: string) {
  const { ano, mes } = parseYM(ym)
  return mes === 12 ? formatYM(ano + 1, 1) : formatYM(ano, mes + 1)
}

export function prevMonth(ym: string) {
  const { ano, mes } = parseYM(ym)
  return mes === 1 ? formatYM(ano - 1, 12) : formatYM(ano, mes - 1)
}

export function getMonthName(ym: string) {
  const { ano, mes } = parseYM(ym)
  return `${copy.meses[mes - 1]} ${ano}`
}

export function dueDateFor(vencimento: number, ym: string) {
  const { ano, mes } = parseYM(ym)
  const ultimoDia = new Date(ano, mes, 0).getDate()
  return new Date(ano, mes - 1, Math.min(vencimento, ultimoDia))
}

export function formatDueDate(vencimento: number, ym: string) {
  const d = dueDateFor(vencimento, ym)
  return d.toLocaleDateString('pt-BR')
}

export function isOverdue(vencimento: number, ym: string) {
  const hoje = new Date()
  const hojeInicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
  return dueDateFor(vencimento, ym) < hojeInicio
}

export function isCurrentOrPastMonth(ym: string) {
  return ym <= getCurrentMonth()
}

export function formatValor(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
