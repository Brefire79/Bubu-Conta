import type { BillWithStatus } from '../types'

export function valorEfetivo(c: BillWithStatus) {
  return c.status_enum === 'pago' ? c.status?.valor_pago ?? c.valor : c.valor
}
