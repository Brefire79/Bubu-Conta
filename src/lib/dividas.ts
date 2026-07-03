import type { Bill, BillStatus, Divida } from '../types'
import { contaAtivaNoMes } from './parcelas'
import { getCurrentMonth, nextMonth } from './dates'

export function calcularDividas(bills: Bill[], statuses: BillStatus[]): Divida[] {
  const mesAtual = getCurrentMonth()
  const porChave = new Map(statuses.map(s => [`${s.bill_id}|${s.mes_referencia}`, s]))
  const dividas: Divida[] = []
  for (const bill of bills) {
    if (!bill.ativo) continue
    let ym = bill.created_at.slice(0, 7)
    while (ym < mesAtual) {
      if (contaAtivaNoMes(bill, ym)) {
        const st = porChave.get(`${bill.id}|${ym}`)
        if (!st || (!st.pago && !st.transferida)) {
          dividas.push({ ...bill, status: st, status_enum: 'atrasado', mes_divida: ym })
        }
      }
      ym = nextMonth(ym)
    }
  }
  return dividas.sort((a, b) => a.mes_divida.localeCompare(b.mes_divida) || a.vencimento - b.vencimento)
}
